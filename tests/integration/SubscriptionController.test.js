import "babel-polyfill";

let server;
const mongoose = require("mongoose");
const request = require("supertest");
const User = require("../../models/User");
const Answer = require("../../models/Answer");
const Subscription = require("../../models/Subscription");
const Question = require("../../models/Question");
const hasher = require("../../utility/hasher");


describe("Question Resource", () => {

	beforeEach(() => {
		server = require("../../app");
	});

	afterEach(async () => {
		server.close();
		await Subscription.deleteMany({});
		await Question.deleteMany({});
		await User.deleteMany({});
		await Answer.deleteMany({});
	});

	const baseURL = "/api/v1/subscriptions";

	describe("Create a new subscription", () => {

		it("should return a 401 if the client is not logged in", async () => {
			const payload = {};
			const response = await request(server)
				.post(`${baseURL}/question`)
				.send(payload);
			expect(response.status).toEqual(401);
			expect(response.body.message).toEqual("You need to be signed in to perform this operation");
		});

		it("should return a 400 if the payload does not have a question", async () => {
			const token = (new User()).generateJsonWebToken();
			const payload = {
				user: mongoose.Types.ObjectId()
			};
			const response = await request(server)
				.post(`${baseURL}/question`)
				.set("x-auth-token", token)
				.send(payload);
			expect(response.status).toEqual(400);
		});
		it("should return a 400 if the question does not exist", async () => {
			const token = (new User()).generateJsonWebToken();
			const payload = {
				user: mongoose.Types.ObjectId()
			};
			const response = await request(server)
				.post(`${baseURL}/question`)
				.set("x-auth-token", token)
				.send(payload);
			expect(response.status).toEqual(400);
		});

		it("should return a 200 for a valid payload", async () => {
			const testUser = await User.create({
				firstname: "test_firstname",
				lastname: "test_lastname",
				email: "test@email.com",
				password: await hasher.encryptPassword("boozai123")
			});
			const testQuestion = await Question.create({
				question: "test question",
				user: testUser._id
			});
			const token = testUser.generateJsonWebToken();
			const payload = {
				question: testQuestion._id,
			};
			const response = await request(server)
				.post(`${baseURL}/question`)
				.set("x-auth-token", token)
				.send(payload);
			expect(response.status).toEqual(201);
			expect(response.body.message).toEqual("User subscribed to question successfully");
		});
	});

	describe("Get all subscriptions for a question", () => {
		it("should get all subscriptions for a question", async () => {
			const adminToken = (new User({isAdmin: true})).generateJsonWebToken();
			const question = mongoose.Types.ObjectId();
			await Subscription.insertMany([
				{
					question,
					user: mongoose.Types.ObjectId()
				},
				{
					question,
					user: mongoose.Types.ObjectId()
				}
			]);

			const response = await request(server)
				.get(`${baseURL}/question/${question}`)
				.set("x-auth-token", adminToken);
			expect(response.status).toEqual(200);
			expect(response.body.message).toEqual("Subscriptions for question");

		});
	});
});
