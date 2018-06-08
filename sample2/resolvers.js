import {User} from '../models/user';
import {Category} from '../models/category';
import {UnauthorizedError} from '../utility/error';
import {SubCategory} from '../models/subCategory';
import {Questionnaire} from "../models/questionnaire";
import {Answer} from "../models/answer";
import {_} from "lodash"
import {Topic} from "../models/topic";

export const resolvers = {
    Query: {
        login: async (root, args) => {

            const user = await User.findOne({email: args.email, password: args.password});
            if (!user)
                throw new UnauthorizedError();
            return user;
        },
        category: async (root, args) => {

            const category = await Category.find({}).populate({path: 'subCategory', select: {}}).exec();
            if (!category)
                throw new UnauthorizedError();
            return category;
        },
        question: async (root, args) => {

            const questionList = await Questionnaire.aggregate(
                [
                    {$match: {subCategory: args.id}},
                    {$sort: {level: 1}}
                ]
            );
            console.log(questionList);

            return questionList;
        },
        answer: async (root, args) => {

            const answerList = await Answer.find({});
            console.log(answerList);
            if (!answerList)
                throw new UnauthorizedError();
            return answerList;
        },
        topic: async (root, args) => {
            const topicList = await Topic.find({});
            return topicList;
        }
    },
    Mutation: {
        register: (root, args) => {
            const user = new User(args);
            return user.save();
        }
    },
};
