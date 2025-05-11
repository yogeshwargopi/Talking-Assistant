import traceback
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

class AuthenticationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, rawRequest, call_next):
        try:
            request : Request = rawRequest
            # Clean the route path by removing '/api' prefix and trailing slash
            request.scope['path'] = request.scope['path'].replace('/api', '').rstrip('/')
            print(rawRequest)
            # Pass the request to the next middleware/route handler
            response = await call_next(rawRequest)
            return response
            
        except Exception as e:
            traceback.print_exc()
            return JSONResponse({"status":"error", "message":"ACCESS_ERROR"})