const status = require("http-status");

const response = require("../../../utility/response");
const QuestionRepository = require("../../../repositories/QuestionRepository");
const validateCreateQuestion = require("../../../validations/question/validate-create-question");
const handleCall = require("../../../helper/handleCall");

class QuestionController {

    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<*>}
     */
    async create (req, res, next) {
        const { error } = validateCreateQuestion(req.body);
        if (error) {
            return response.sendError({ res, message: error.details[0].message });
        }
        const { question } = req.body;
        // Extract the userId from the request and alias it to user
        const { userId: user } = req.user;
        const newQuestion = {
            question, user,
        };
        return handleCall((async () => {
            const question = await QuestionRepository.create(newQuestion);
            return response.sendSuccess({
                res,
                statusCode: status.CREATED,
                message: "Question created successfully",
                body: question,
            });
        }), next);
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<*>}
     */
    async getAll (req, res, next) {
        return handleCall((async () => {
            const questions = await QuestionRepository.findAll();
            return response.sendSuccess({ res, body: questions, message: "All questions" });
        }), next);
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<*>}
     */
    async getOne (req, res, next) {

        const { id } = req.params;
        return handleCall((async () => {
            const question = await QuestionRepository.findOne(id);
            if (!question) {
                return response.sendError({ res, statusCode: status.NOT_FOUND, message: "Question not found" });
            }
            return response.sendSuccess({ res, body: question, message: "Single question gotten successfully" });
        }), next);
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<*>}
     */
    async update (req, res, next) {
        const { id } = req.params;
        const { userId: user, isAdmin } = req.user;
        const { error } = validateCreateQuestion(req.body);
        if (error) {
            return response.sendError({ res, message: error.details[0].message });
        }
        let { question: updatedQuestion } = req.body;
        return handleCall((async () => {
            const question = await QuestionRepository.findOne(id);
            if (!question) {
                return response.sendError({ res, statusCode: status.NOT_FOUND, message: "Question not found" });
            }
            if (user === question.user.toString() || isAdmin) {
                question.question = updatedQuestion;
                const result = await question.save();
                return response.sendSuccess({ res, message: "Question updated successfully", body: result });
            }
            return response.sendError({
                res,
                statusCode: status.UNAUTHORIZED,
                message: "You do not have the right to update this question",
            });
        }), next);
    }
}

module.exports = new QuestionController;
