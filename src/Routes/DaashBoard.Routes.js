import express from "express";
import Auth from "../Auth/Auth.middleware.js"
import { DashboardSummary , GetCategory , MonthlyTrends,WeekTrends,MostExpensiveCategory,TopCategoriesbycount, FilterbyType } from "../Controllers/DashBoard.Controller.js";

const DashboardRouter = express.Router()


DashboardRouter.get("/summary",Auth,DashboardSummary);
DashboardRouter.get("/typefilter",Auth,FilterbyType)
DashboardRouter.get("/categories",Auth,GetCategory);
DashboardRouter.get("/trends/monthly",Auth,MonthlyTrends);
DashboardRouter.get("/trends/weekly",Auth,WeekTrends);
DashboardRouter.get("/categories/top",Auth,TopCategoriesbycount);
DashboardRouter.get("/categories/mostexpensive",Auth,MostExpensiveCategory)



export default DashboardRouter