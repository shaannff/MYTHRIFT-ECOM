const Order=require('../../models/order_model')


const loadReport=async(req,res,next)=>{
try {
    const reportval=req.params.id

    if(reportval=='Week'){

        const presentDate=new Date()

        const weekBegining = new Date(
            presentDate.getFullYear(),
            presentDate.getMonth(),
            presentDate.getDate() - presentDate.getDay()
          );
    
          const weekEnd = new Date(weekBegining);
          weekEnd.setDate(weekEnd.getDate() + 7);
    
          const overallReport = await Order.find({
            orderDate: { $gte: weekBegining, $lte: weekEnd },
            products: { $elemMatch: { orderProStatus: "delivered" } },
          });
          console.log(overallReport,'reportttt')
          res.render('salesReport',{overallReport,
            data: "Week",
            reportVal: req.params.id,})

    } else if (reportval == "Month") {

        const crrDate = new Date();
        const crrMonth = crrDate.getMonth();
        const startDate = new Date(crrDate.getFullYear(), crrMonth);
        const endDate = new Date(crrDate.getFullYear(), crrMonth + 1, 0);
  
        const overallReport = await Order.find({
          orderDate: { $gte: startDate, $lte: endDate },
          products: { $elemMatch: { orderProStatus: "delivered" } },
        });
        console.log(overallReport,'reportttt')

        res.render("salesReport", {
          overallReport,
          data: "Month",
          reportVal: req.params.id,
        });
        
    } else if (reportval == "Year") {
        const crrDate = new Date();
        const yearStart = new Date(crrDate.getFullYear(), 0, 1);
        const yearEnd = new Date(crrDate.getFullYear() + 1, 0, 0);
  
        const overallReport = await Order.find({
          orderDate: { $gte: yearStart, $lte: yearEnd },
          products: { $elemMatch: { orderProStatus: "delivered" } },
        });
        console.log(overallReport,'reportttt')

  
        res.render("salesReport", {
          overallReport,
          data: "Year",
          reportVal: req.params.id,
        });

      }  else if (reportval == "custom") {
        console.log(23333)
        console.log('reportttt',12345678)

        res.render("salesReport", {
          custompass: true,
          reportVal: req.params.id,
          data: "custom",
        });

      } else {
        res.redirect("/admin");
      }

} catch (err) {
  next(error,req,res) 
}
}

  
const customReport = async (req, res, next) => {
  try {
    const startDate = new Date(req.body.startDatee);

    const endDate = new Date(req.body.endDatee);
    endDate.setDate(endDate.getDate() + 1);

    const getData = await Order.find({
      orderDate: { $gte: startDate, $lte: endDate },
      products: {
        $elemMatch: { orderProStatus: "delivered" },
      },
    });

    res.send({ getData });
  } catch (err) {
    next(error,req,res) 
  }
};

module.exports={
    loadReport,
    customReport
}