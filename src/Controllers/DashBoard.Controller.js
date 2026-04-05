import { Records } from "../Models/Records.model.js";


const DashboardSummary = async (req , res)=>{

    try {

        const dashboarddata = await Records.aggregate([
            {
                $match:{isDeleted:false},

            },
            {
                $group:{
                    _id:null,
                    income:{
                        $sum:{
                            $cond: [{ $eq: ["$type", "income"] }, "$amount", 0]
                        }
                    },
                    expense:{
                        $sum:{
                            $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0]
                        }

                    },
                    count: { $sum: 1 }

                }
            },
           

        ])
        
        if(dashboarddata.length === 0){
            return res.status(400).json({
                message: "Record aggregation failed"
            })
        }

        const result = dashboarddata[0] || { income: 0, expense: 0, count: 0 };


        return res.status(200).json({
            income: result.income,
            expense: result.expense,
            count: result.count,
             netBalance: result.income - result.expense
        });

    } catch (error) {
        console.log(`unable to fetch dashboardsummert`,error.message);
        return res.status(500).json({
            message:"Server Error while Loading DashBoard"
        })
        
    }

}



const GetCategory = async (req,res)=>{
    try {
        if(req.user.role !== "admin" && req.user.role !== "analyst"){
            return res.status(403).json({
                message:"Your are Not Autorized"
            })
        }

        const categorydata = await Records.aggregate([
            {
                $match:{isDeleted:false}
            },
            {
                $group:{
                    _id:"$category",
                    total:{
                        $sum:"$amount",
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort:{
                    total:-1
                }
            }
        ])

        if(categorydata.length === 0){
            return res.status(400).json({
                message:"Getcategory aggregation failed"
            })
        }


        return res.status(200).json({
            message:"Catagory data are",
            categorydata
        })
        
    } catch (error) {
        console.log(`unable to getcategory`,error.message)
        return res.status(500).json({
            message:"Server Error unable to Get Category"
        })
    }

}



const MonthlyTrends = async (req,res)=>{
    try {
          if(req.user.role !== "admin" && req.user.role !== "analyst"){
            return res.status(403).json({
                message:"Your are Not Autorized"
            })
        }

        const monthlydata = await Records.aggregate([
            {
                $match: { isDeleted: false }
            },
            {
                $group:{
                     _id: { $month: "$date" },
                     income: {
                            $sum:{
                             $cond: [{ $eq: ["$type", "income"] }, "$amount", 0]
                            }
                        },

                     expense:{
                        $sum:{
                            $cond:[{$eq:["$type","expense"]},"$amount",0]
                        }
                        
                     }

                }
                
            },{
                $sort: { _id: 1 }
            }
            
        ])

        if(monthlydata.length === 0){
            return res.status(200).json({
                message:"No Data Available"}
            )
        }


        return res.status(200).json({
            message:"Monthly Trends",
            monthlydata
        })

        
    } catch (error) {
        console.log(`unable to load monthlytrends` ,error.message)
        return res.status(500).json({
            message:"Server Error Unable to load MonthlyTrends"
        })
    }

}



const WeekTrends = async (req,res)=>{

    try {
        if(req.user.role !== "admin" && req.user.role !== "analyst"){
            return res.status(403).json({
                message:"Your are Not Autorized"
            })
        }

        const weeklydata = await Records.aggregate([
            {
                $match:{isDeleted:false}
            },
            {
                $group:{
                    _id:{$isoWeek: "$date" },
                    income:{
                        $sum:{
                            $cond: [{ $eq: ["$type", "income"] }, "$amount", 0]
                        }
                    },

                    expense:{
                        $sum:{
                            $cond:[{ $eq: ["$type", "expense"] },"$amount",0]
                        }
                    },

                }
            },
            {
              $sort:{_id:1}
            }
        ])

        if(weeklydata.length === 0){
            return res.status(200).json({
                message:"No Weekly data Available"
            })
        }
        
        return res.status(200).json({
            message:"Weekly Explense",
            weeklydata
        })
    } catch (error) {
        console.log(`unable to load weekly trends` ,error.message)
        return res.status(500).json({
            message:"Server Error Uable to Load Weekly Trends"
        })
        
    }

}



const TopCategoriesbycount = async (req,res)=>{

    //based on entry count
    try {
         if(req.user.role !== "admin" && req.user.role !== "analyst"){
            return res.status(403).json({
                message:"Your are Not Autorized"
            })
        }

        const topcategorydata = await Records.aggregate([
            {
                $match:{isDeleted:false}
            },
            {
                $group: {
                    _id: "$category",   
                     count: { $sum: 1 }  
                }
            },
            {$sort:{count:-1}},
            {
                $limit:5
            }
        ])

        if(topcategorydata.length === 0){
            return res.status(200).json({
                message:"No Record Found"
            })
        }


        return res.status(200).json({
            message:"Top Catogeries are",
            topcategorydata
        })
    } catch (error) {
        console.log(`unable to load top categories`,error.message)

        return res.status(500).json({
            message:"Server Error Unable to load TopCategories"
        })
    }
}



const MostExpensiveCategory = async (req,res)=>{

    //based on amount
    try {
         if(req.user.role !== "admin" && req.user.role !== "analyst"){
            return res.status(403).json({
                message:"Your are Not Autorized"
            })
        }

        const expensivecategorydata = await Records.aggregate([
            {
                $match:{isDeleted:false}
            },
            {
                $group: {
                    _id: "$category",   
                    totalamount: { 
                        $sum:"$amount"
                     }  
                }
            },
            {$sort:{totalamount:-1}},
            {
                $limit:3
            }
        ])

        if(expensivecategorydata.length === 0){
            return res.status(200).json({
                message:"No Record Found"
            })
        }


        return res.status(200).json({
            message:"Most Expensive Catogeries are",
            expensivecategorydata
        })
    } catch (error) {
        console.log(`unable to load most Expensive categories`,error.message)

        return res.status(500).json({
            message:"Server Error Unable to load MostExpensiveCategory"
        })
    }

}



 export {DashboardSummary , GetCategory , MonthlyTrends,WeekTrends,MostExpensiveCategory,TopCategoriesbycount}