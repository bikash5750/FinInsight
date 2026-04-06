import { Records } from "../Models/Records.model.js";
import { RecordValidator ,UpdateRecordValidator ,CheakRecordID } from "../Validators/Records.Validator.js";


const CreateRecords = async (req,res)=>{

    try {

        //console.log(`i am in createrecode controller`)
        
        if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Only Admin can create records" });
        }

        const { amount, type, date, category, notes ,recordid } = req.body;

        if(amount===undefined || !type || !date || !category || !notes || !recordid){
            return res.status(401).json({message:"Required all Input Field"})
        }

       const result = RecordValidator.safeParse(req.body);

       if (!result.success) {
        const message = result.error.issues[0].message;
        return res.status(400).json({ message });
      }

        const findrecord = await Records.findOne({recordid})

        if(findrecord){
            return res.status(400).json({
                message:"Record allready Exist"
            })
        }
      

        const record = await Records.create({
          amount,
          recordid,
          type,
          date,
          category,
          createdby: req.user.id,
          notes,
          isDeleted: false
         });



         return res.status(201).json({
           message: "Record created successfully",
              record
        });


    } catch (error) {

        console.log(`error while creating record`,error.message)
        return res.status(500).json({message:"Server Error while creating Records"})
        
    }

}


const UpdateRecords = async (req,res)=>{
    try {

        if(req.user.role !== "admin"){
            return res.status(403).json({ message: "Only Admin can update records" });
        }
        
        const { amount, type, date, category, notes ,recordid } = req.body;

        if(!amount || !type || !date || !category || !notes || !recordid){
            return res.status(400).json({message:"Required all Input Field"})
        }

        const resultrecord = UpdateRecordValidator.safeParse(req.body)

        if(!resultrecord.success){
            const message = resultrecord.error.issues[0].message;
            return res.status(400).json({ message });
        }


        const record = await Records.findOne({recordid})
        if(!record){
            return res.status(404).json({message:"No Record Found"})
        }

        if(amount) record.amount = amount;
        if(date) record.date = date;
        if(category) record.category = category;
        if(notes) record.notes = notes;
        if(type) record.type = type;


        await record.save()

        return res.status(200).json({
            message:"Record Updated",
            record
        })


    } catch (error) {

        console.log(`Unable to update Records`, error);
        return res.status(500).json({message:"Server Error Unable to update Records"})
        
    }
}


const DeleteRecords = async (req,res)=>{
    try {

        if(req.user.role !== "admin"){
            return res.status(403).json({
                message:"Only Admin Can Delete Details"
            })
        }

        const {recordid} = req.body;
        if(!recordid){
            return res.status(400).json({
                message:"Input Field is Empty"
            })
        }

        const validaterecordid = CheakRecordID.safeParse(req.body)

        if(!validaterecordid.success){
            const message = validaterecordid.error.issues[0].message;

            return res.status(400).json({
                message:"Invalid RecordID Formate"
            })
        }

        const recordfound = await Records.findOne({recordid,isDeleted:false})

        if(!recordfound){
            return res.status(400).json({
                message:"No Record Found or Already Deleted"
            })
        }

        recordfound.isDeleted = true;
        await recordfound.save();

        return res.status(200).json({
            message:"Deleted Records",
            recordfound
        })
        
    } catch (error) {
        console.log(`Unable to delete records`,error)
        return res.status(500).json({
            message:"Server Error While Deleteing Records"
        })
        
    }
}


const ViewAllRecords = async (req,res)=>{
    try {

        if (req.user.role !== "admin" && req.user.role !== "analyst"){
         return res.status(403).json({message : "you are not Autorized to get all Recordsdetails"})
       }

    
       const records = await Records.find({ isDeleted: false });

        if(records.length === 0){
        return res.status(200).json({
            message:"No Records Found"
        })
       }



       const page = parseInt(req.query.page) || 1
       const limit = parseInt(req.query.limit) ||5


       const result = await Records.paginate(
        {isDeleted:false},
        {   page,
            limit,
            sort:{createdAt:-1}
        }
        
       )

       return res.status(200).json({
        message:"All RECORDS",
        page:result.page,
        limit:result.limit,
        totalRecords: result.totalDocs,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
        records: result.docs
       })

        
    } catch (error) {
        console.log(`Unable to Load Records`,error)

        return res.status(500).json({
            message:"Server Error Unable to Load Records"
        })
    }
}


const GetRecordsById = async (req,res)=>{
    try {

        
        if (req.user.role !== "admin" && req.user.role !== "analyst"){
         return res.status(403).json({message : "you are not Autorized to get all Recordsdetails"})
        }
        
        const {recordid} = req.body;
        if(!recordid){
            return res.status(400).json({
                message:"RecordID missing"
            })
        }

        const cheakrecordid = CheakRecordID.safeParse(req.body);

        if(!cheakrecordid.success){
            const message = cheakrecordid.error.issues[0].message;

            return res.status(401).json({
                message
            })
        }

        const record = await Records.findOne({recordid, isDeleted:false}," amount type date category notes recordid");
        if(!record){
            return res.status(400).json({
                message:"No Record Found"
            })
        }


        return res.status(200).json({
            message:"Record Details",
            record
        })


    } catch (error) {
        console.log(`unable to get record by ID`, error.message)

        return res.status(500).json({
            message:"Server error Unable to Load Record"
        })
        
    }
}

export {CreateRecords , UpdateRecords ,DeleteRecords ,ViewAllRecords , GetRecordsById}