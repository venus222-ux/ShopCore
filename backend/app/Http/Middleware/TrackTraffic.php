<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\TrafficLog;

class TrackTraffic
{
public function handle(Request $request, Closure $next)
{
    $referer = $request->headers->get('referer');

    $source = 'Direct';

    if ($referer) {
        if (str_contains($referer, 'google')) $source = 'Google';
        elseif (str_contains($referer, 'facebook')) $source = 'Facebook';
        elseif (str_contains($referer, 'tiktok')) $source = 'TikTok';
        else $source = 'Referral';
    }

    $ua = $request->userAgent();

    // very simple browser detection
    $browser = 'Unknown';
    if (str_contains($ua, 'Chrome')) $browser = 'Chrome';
    elseif (str_contains($ua, 'Firefox')) $browser = 'Firefox';
    elseif (str_contains($ua, 'Safari')) $browser = 'Safari';

    $platform = 'Unknown';
    if (str_contains($ua, 'Windows')) $platform = 'Windows';
    elseif (str_contains($ua, 'Mac')) $platform = 'MacOS';
    elseif (str_contains($ua, 'Linux')) $platform = 'Linux';
    elseif (str_contains($ua, 'Android')) $platform = 'Android';
    elseif (str_contains($ua, 'iPhone')) $platform = 'iOS';

    $device = (str_contains($ua, 'Mobile') || str_contains($ua, 'Android'))
        ? 'Mobile'
        : 'Desktop';

    TrafficLog::create([
        'ip' => $request->ip(),
        'path' => $request->path(),
        'source' => $source,
        'user_agent' => $ua,
        'user_id' => auth()->id(),
        'browser' => $browser,
        'platform' => $platform,
        'device' => $device,
    ]);

    return $next($request);
}
}
