<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);

        // Append security headers to every response globally
        $middleware->append(\App\Http\Middleware\SecurityHeadersMiddleware::class);

        $middleware->alias([
            'admin'          => \App\Http\Middleware\AdminMiddleware::class,
            'audit'          => \App\Http\Middleware\AuditMiddleware::class,
            'active.member'  => \App\Http\Middleware\ActiveMemberMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
