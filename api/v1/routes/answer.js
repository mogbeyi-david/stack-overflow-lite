const express = require("express");
const router = express.Router();
const AnswerController = require("../controllers/AnswerController");
const VoteController = require("../controllers/VoteController");
const authMiddleware = require("../../../middlewares/auth");
const validateObjectIdMiddleware = require("../../../middlewares/validate-objectId");

//Post Requests
router.post("/", [authMiddleware], AnswerController.create);

// Get Requests
router.get("/question/:id", [validateObjectIdMiddleware],AnswerController.findAllForQuestion);
router.get("/:id", [validateObjectIdMiddleware],AnswerController.findOne);
router.get("/", AnswerController.findAll);

router.put("/:id/vote", [validateObjectIdMiddleware, authMiddleware], VoteController.voteAnswer);
router.put("/:id", [validateObjectIdMiddleware, authMiddleware], AnswerController.update);

module.exports = router;
