from fastapi import Request, status
from fastapi.responses import JSONResponse
import time

# This would typically use a more persistent store like Redis
request_counts = {}

async def rate_limiting_middleware(request: Request, call_next):
    """
    Placeholder for a simple, in-memory rate limiting middleware.
    """
    client_ip = request.client.host
    current_time = time.time()

    # Clean up old timestamps
    if client_ip in request_counts:
        request_counts[client_ip] = [t for t in request_counts[client_ip] if current_time - t < 60]

    # Check request count
    if client_ip in request_counts and len(request_counts[client_ip]) >= 100: # 100 requests per minute
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"detail": "Too many requests."},
        )

    # Log new request timestamp
    request_counts.setdefault(client_ip, []).append(current_time)

    response = await call_next(request)
    return response


async def input_sanitization_middleware(request: Request, call_next):
    """
    Placeholder for an input sanitization middleware.
    In a real app, you would use libraries like 'bleach' to clean
    request bodies to prevent XSS attacks, especially for endpoints
    that handle user-generated HTML content.
    """
    # For now, we just log and pass through.
    # print(f"Sanitizing request to {request.url.path} (placeholder)...")
    response = await call_next(request)
    return response
