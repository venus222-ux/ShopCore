<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MongoLog;
use App\Models\Order;
use App\Models\Product;
use App\Models\TrafficLog;
use App\Models\TrafficLogs;
use App\Models\User;
use App\Services\OrderPaymentService;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /* ================= PRODUCTS ================= */

    public function index(Request $request)
    {
        return Order::with(['items.product', 'user'])
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->input('search');
                $q->where(function ($q) use ($search) {
                    $q->where('id', 'like', "%{$search}%")
                        ->orWhere('invoice_number', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($q) => $q->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%"));
                });
            })
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->latest()
            ->paginate($request->input('per_page', 20));
    }

    public function show($id)
    {
        return Order::with(['items.product', 'user', 'refunds', 'shippingMethod'])
            ->findOrFail($id);
    }

    /**
     * Manually mark a pending order as paid - e.g. bank transfer confirmed
     * outside Stripe, or correcting an order stuck in "pending" after a
     * webhook was missed. Triggers the exact same side effects as a Stripe
     * webhook confirmation: confirmation email + inventory finalization.
     */
    public function complete(Order $order, OrderPaymentService $orderPaymentService)
    {
        if ($order->status === 'paid') {
            return response()->json(['message' => 'Order is already paid.'], 422);
        }

        if ($order->status === 'refunded' || $order->status === 'cancelled') {
            return response()->json(['message' => "Cannot complete an order with status '{$order->status}'."], 422);
        }

        $order = $orderPaymentService->markPaid($order);

        return response()->json([
            'message' => 'Order marked as completed. Stock is being updated.',
            'order'   => $order->fresh(['items.product', 'user']),
        ]);
    }
    /* ================= LOGS ================= */

    public function logs(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $search  = $request->input('search');

        $query = MongoLog::query()->orderBy('created_at', 'desc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('file_name', 'like', "%{$search}%")
                  ->orWhere('ip', 'like', "%{$search}%")
                  ->orWhere('uploaded_by', 'like', "%{$search}%");
            });
        }

        $logs = $query->paginate($perPage);

        return response()->json($logs);
    }

    public function deleteLog($id)
    {
        $log = MongoLog::find($id);

        if (!$log) {
            return response()->json(['message' => 'Log not found'], 404);
        }

        $log->delete();

        return response()->json(['message' => 'Log deleted successfully']);
    }

    public function exportLogs(Request $request)
    {
        $search = $request->input('search');

        $query = MongoLog::query()->orderBy('created_at', 'desc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('file_name', 'like', "%{$search}%")
                  ->orWhere('ip', 'like', "%{$search}%")
                  ->orWhere('uploaded_by', 'like', "%{$search}%");
            });
        }

        $logs = $query->get();

        $headers = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="upload_logs_' . now()->format('Y-m-d_His') . '.csv"',
        ];

        $columns = [
            'Date',
            'File Name',
            'Size (MB)',
            'MIME',
            'Product ID',
            'IP',
            'Uploaded By',
            'User Agent'
        ];

        $callback = function () use ($logs, $columns) {
            $file = fopen('php://output', 'w');

            fputcsv($file, $columns);

            foreach ($logs as $log) {
                fputcsv($file, [
                    $log->created_at,
                    $log->file_name,
                    round($log->size / (1024 * 1024), 2),
                    $log->mime,
                    $log->product_id,
                    $log->ip,
                    $log->uploaded_by,
                    $log->user_agent,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /* ================= USERS ================= */

    public function users()
    {
        $users = User::with('roles')->get();

        return response()->json($users);
    }

    public function deleteUser($id)
    {
        $user = User::findOrFail($id);

        if ($user->id === auth()->id()) {
            return response()->json([
                'message' => 'Cannot delete your own account'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }

    /* ================= ORDERS ================= */

    public function orders(Request $request)
    {
        $perPage   = $request->input('per_page', 20);
        $search    = $request->input('search');
        $status    = $request->input('status');
        $startDate = $request->input('start_date');
        $endDate   = $request->input('end_date');

        $query = Order::with(['user', 'items.product'])->latest();

        /* SEARCH */
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($user) use ($search) {
                      $user->where('name', 'like', "%{$search}%")
                           ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        /* STATUS */
        if (!empty($status) && $status !== 'all') {
            $query->whereRaw('LOWER(status) = ?', [strtolower($status)]);
        }

        /* DATE FILTER */
        if (!empty($startDate)) {
            $query->whereDate('created_at', '>=', $startDate);
        }

        if (!empty($endDate)) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        $orders = $query->paginate($perPage);

        return response()->json([
            'data' => $orders->items(),
            'pagination' => [
                'current_page' => $orders->currentPage(),
                'last_page'    => $orders->lastPage(),
                'per_page'     => $orders->perPage(),
                'total'        => $orders->total(),
            ]
        ]);
    }


/* ================= DASHBOARD STATS ================= */
public function dashboardStats()
{
    $today = now()->startOfDay();
    $thisMonth = now()->startOfMonth();

    // ================= KPIs =================
    $todayRevenue = Order::where('created_at', '>=', $today)->sum('total');
    $monthRevenue = Order::where('created_at', '>=', $thisMonth)->sum('total');
    $totalRevenue = Order::sum('total');

    $totalOrders = Order::count();
    $pendingOrders = Order::where('status', 'pending')->count();
    $refundsCount = \App\Models\Refund::count();

    $newUsers = User::where('created_at', '>=', $thisMonth)->count();

    $aov = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

    // ================= SALES CHART =================
    $salesData = Order::selectRaw('DATE(created_at) as date, SUM(total) as revenue, COUNT(id) as orders')
        ->where('created_at', '>=', now()->subDays(30))
        ->groupBy('date')
        ->orderBy('date', 'asc')
        ->get();

    // ================= REAL TRAFFIC (SOURCE) =================
    $trafficBySource = TrafficLog::selectRaw('source, COUNT(*) as value')
        ->where('created_at', '>=', now()->subDays(30))
        ->groupBy('source')
        ->orderByDesc('value')
        ->get();

    // ================= REAL TRAFFIC (BROWSER) =================
    $trafficByBrowser = TrafficLog::selectRaw('browser as source, COUNT(*) as value')
        ->where('created_at', '>=', now()->subDays(30))
        ->groupBy('browser')
        ->orderByDesc('value')
        ->get();

    // ================= REAL TRAFFIC (DEVICE) =================
    $trafficByDevice = TrafficLog::selectRaw('device as source, COUNT(*) as value')
        ->where('created_at', '>=', now()->subDays(30))
        ->groupBy('device')
        ->orderByDesc('value')
        ->get();

    // ================= RESPONSE =================
    return response()->json([
        'kpis' => [
            'today_revenue' => $todayRevenue,
            'month_revenue' => $monthRevenue,
            'total_revenue' => $totalRevenue,
            'total_orders'  => $totalOrders,
            'pending_orders'=> $pendingOrders,
            'refunds'       => $refundsCount,
            'new_users'     => $newUsers,
            'aov'           => round($aov, 2),
            'conversion_rate' => 2.4,
            'products_sold' => 342,
            'estimated_profit' => $totalRevenue * 0.4,
        ],
        'charts' => [
            'sales' => $salesData,

            // 🔥 REAL ANALYTICS
            'traffic' => $trafficBySource,
            'traffic_browser' => $trafficByBrowser,
            'traffic_device' => $trafficByDevice,
        ]
    ]);
}
}
