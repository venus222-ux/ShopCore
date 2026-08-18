<?php

use App\Http\Controllers\AddressController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\AttributeController;
use App\Http\Controllers\Admin\AttributeValueController;
use App\Http\Controllers\Admin\CategoryAttributeController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\CouponController as AdminCouponController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ProductVariantController;
use App\Http\Controllers\Admin\RefundController;
use App\Http\Controllers\Admin\SettingsController as AdminSettingsController;
use App\Http\Controllers\Admin\ShippingMethodController as AdminShippingMethodController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\DownloadController;
use App\Http\Controllers\ImageProxyController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\Product\CategoryController;
use App\Http\Controllers\Product\PublicProductController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\ShippingMethodController;
use App\Http\Controllers\StripeWebhookController;
use App\Http\Controllers\UserRefundController;
use App\Http\Controllers\WishlistController;
use App\Models\Setting;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;

Broadcast::routes(['middleware' => ['auth:api']]);

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword'])
    ->name('password.reset');
Route::post('/refresh', [AuthController::class, 'refresh']);

Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle']);

Route::get('/shipping-methods', [ShippingMethodController::class, 'index']);

Route::get('/settings', function () {
    return [
        'vat_percent' => config('tax.vat_percent'),
        'coupons_enabled' => (bool) (int) Setting::get('coupons_enabled', '1'),
        'cod_enabled' => (bool) (int) Setting::get('cod_enabled', '1'),
        'cod_max_order_value' => (float) Setting::get('cod_max_order_value', '500'),
        'cod_fee' => (float) Setting::get('cod_fee', '0'),
    ];
});

Route::get('/images/{path}', [ImageProxyController::class, 'show'])
    ->where('path', '.*');

// Protected routes with auth + throttle
Route::middleware(['jwt.auth'])->group(function () {
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/dashboard', function () {
        return response()->json(['message' => 'User Dashboard']);
    });

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::delete('/profile', [AuthController::class, 'destroyProfile']);

    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::put('/addresses/{address}', [AddressController::class, 'update']);
    Route::delete('/addresses/{address}', [AddressController::class, 'destroy']);

    Route::post('/coupons/validate', [CouponController::class, 'validateCode']);

    Route::post('/checkout', [CheckoutController::class, 'checkout']);
    Route::get('/orders/verify', [CheckoutController::class, 'verify']);
    Route::post('/orders/{id}/confirm-cash', [OrderController::class, 'adminConfirmCash']);

    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::get('/orders/{id}/invoice', [OrderController::class, 'invoice']);

    Route::get('/products/{product}/download', [DownloadController::class, 'download']);
    Route::get('/user/interested-products', [AuthController::class, 'interestedProducts']);

    Route::get('/my-refunds', [UserRefundController::class, 'index']);
    Route::post('/orders/{orderId}/refund-request', [UserRefundController::class, 'store']);
    Route::get('/refunds/{id}/credit-note', [UserRefundController::class, 'creditNote']);

});

// Admin routes
Route::prefix('admin')->middleware(['jwt.auth', 'role:admin'])->group(function () {

    Route::get('/dashboard', [AdminController::class, 'dashboard']);

    Route::get('/users', [AdminController::class, 'users']);
    Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);

    Route::post('/orders/{id}/refund', [RefundController::class, 'refund']);
    Route::get('/refunds', [RefundController::class, 'index']);
    Route::get('/refund-requests', [RefundController::class, 'requests']);
    Route::post('/refund-requests/{id}/approve', [RefundController::class, 'approve']);
    Route::post('/refund-requests/{id}/reject', [RefundController::class, 'reject']);
    Route::get('/refunds/{id}/credit-note', [RefundController::class, 'creditNote']);

    Route::get('/categories', [AdminCategoryController::class, 'index']);
    Route::post('/categories', [AdminCategoryController::class, 'store']);
    Route::delete('/categories/{category}', [AdminCategoryController::class, 'destroy']);

    // Category tree + facet configuration (additive - AdminCategoryController
    // itself isn't touched, so its own store()/destroy() behavior is unchanged)
    Route::put('/categories/{category}/parent', [CategoryAttributeController::class, 'updateParent']);
    Route::get('/categories/{category}/attributes', [CategoryAttributeController::class, 'index']);
    Route::put('/categories/{category}/attributes', [CategoryAttributeController::class, 'sync']);

    // Attributes & values (Color, Size, ...)
    Route::get('/attributes', [AttributeController::class, 'index']);
    Route::post('/attributes', [AttributeController::class, 'store']);
    Route::put('/attributes/{attribute}', [AttributeController::class, 'update']);
    Route::delete('/attributes/{attribute}', [AttributeController::class, 'destroy']);

    Route::post('/attributes/{attribute}/values', [AttributeValueController::class, 'store']);
    Route::put('/attribute-values/{attributeValue}', [AttributeValueController::class, 'update']);
    Route::delete('/attribute-values/{attributeValue}', [AttributeValueController::class, 'destroy']);

    // Product variants (the ProductForm variant builder)
    Route::get('/products/{product}/variants', [ProductVariantController::class, 'index']);
    Route::post('/products/{product}/variants', [ProductVariantController::class, 'store']);
    Route::put('/variants/{variant}', [ProductVariantController::class, 'update']);
    Route::delete('/variants/{variant}', [ProductVariantController::class, 'destroy']);
    Route::put('/variants/{variant}/inventory', [ProductVariantController::class, 'updateInventory']);

    // Shipping methods
    Route::get('/shipping-methods', [AdminShippingMethodController::class, 'index']);
    Route::post('/shipping-methods', [AdminShippingMethodController::class, 'store']);
    Route::put('/shipping-methods/{shippingMethod}', [AdminShippingMethodController::class, 'update']);
    Route::delete('/shipping-methods/{shippingMethod}', [AdminShippingMethodController::class, 'destroy']);

    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{product}', [ProductController::class, 'update']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);
    Route::delete('/products/{product}/media/{media}', [ProductController::class, 'deleteMedia'])
        ->name('admin.products.media.delete');
    Route::get('/products/{product}', [ProductController::class, 'show']);

    Route::get('/logs', [AdminController::class, 'logs']);
    Route::delete('/logs/{id}', [AdminController::class, 'deleteLog']);
    Route::get('/logs/export', [AdminController::class, 'exportLogs']);

    Route::get('/orders', [AdminController::class, 'orders']);
    Route::get('/orders/{id}', [OrderController::class, 'adminShow']);
    Route::get('/orders/{id}/invoice', [OrderController::class, 'adminInvoice']);
    Route::post('/orders/{id}/complete', [OrderController::class, 'adminComplete']);
    Route::post('/orders/{id}/release', [OrderController::class, 'adminRelease']);
    Route::post('/orders/{id}/restock', [OrderController::class, 'manualRestock']);
    Route::get('/dashboard-stats', [AdminController::class, 'dashboardStats']);
    Route::post('/orders/{id}/confirm-cash', [OrderController::class, 'adminConfirmCash']);

    Route::get('/coupons', [AdminCouponController::class, 'index']);
    Route::post('/coupons', [AdminCouponController::class, 'store']);
    Route::put('/coupons/{coupon}', [AdminCouponController::class, 'update']);
    Route::delete('/coupons/{coupon}', [AdminCouponController::class, 'destroy']);
    Route::patch('/coupons/{coupon}/toggle-active', [AdminCouponController::class, 'toggleActive']);

    Route::put('/settings', [AdminSettingsController::class, 'update']);
});

// PUBLIC SHOP PAGE MARKETPLACE
Route::get('/products', [PublicProductController::class, 'index']);
Route::get('/products/{slug}', [PublicProductController::class, 'show']);
// Dedicated Search Endpoint
Route::get('/search', [SearchController::class, 'search']);

// Categories
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category:slug}/products', [CategoryController::class, 'products']);

Route::prefix('wishlist')->group(function () {
    Route::get('/', [WishlistController::class, 'index']);
    Route::post('/toggle', [WishlistController::class, 'toggle']);
    Route::delete('/{productId}', [WishlistController::class, 'remove']);
});
