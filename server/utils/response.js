class ApiResponse {
  static success(data = null, message = '操作成功') {
    return {
      success: true,
      message,
      data
    };
  }

  static error(message = '操作失败', code = 500) {
    return {
      success: false,
      message,
      code
    };
  }

  static paginated(list, total, page, pageSize) {
    return {
      success: true,
      data: {
        list,
        pagination: {
          total,
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          totalPages: Math.ceil(total / pageSize)
        }
      }
    };
  }
}

class ApiError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends ApiError {
  constructor(message = '资源不存在') {
    super(message, 404);
  }
}

class ValidationError extends ApiError {
  constructor(message = '参数验证失败') {
    super(message, 400);
  }
}

class UnauthorizedError extends ApiError {
  constructor(message = '未授权') {
    super(message, 401);
  }
}

class ForbiddenError extends ApiError {
  constructor(message = '禁止访问') {
    super(message, 403);
  }
}

module.exports = {
  ApiResponse,
  ApiError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError
};
