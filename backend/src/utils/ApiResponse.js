import { GENERAL_MESSAGES } from "../constants/messages.constants.js";

class ApiResponse {
    constructor(statusCode, data = null, message = GENERAL_MESSAGES.SUCCESS) {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
        this.timeStamp = new Date().toISOString();
    }
}

export default ApiResponse;
