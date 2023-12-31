require('dotenv').config()
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors({
  origin:[
    'http://localhost:5173',
    'https://group-study-assignment-ca6d9.web.app',
    
    'https://group-study-assignment-ca6d9.firebaseapp.com'
  ],
  credentials:true
}));
app.use(express.json());



// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ovs4csm.mongodb.net/?retryWrites=true&w=majority`;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ovs4csm.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();


    const assignmentCollection = client.db('assignmentDB').collection('assignment')

    //auth related
     app.post('/jwt',async(req,res)=>{
      const user = req.body;
      console.log('user for token',user)
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{expiresIn:'2h'})

      res.cookie('token', token,{
        httpOnly:true,
        secure:true,
        sameSite:'none'
      })
      .send({success:true})
     })

     app.post('/logout', async(req,res)=>{
        const user = req.body;
        console.log('logging out', user)
        res.clearCookie('token',{maxAge:0}).send({success:true})
     })


    //service related
    app.get('/assignment',async (req, res)=>{
        const cursor = assignmentCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    //update
    app.put('/assignment/:id', async(req, res) =>{
      const id = req.params.id;
      const filter = { _id: new ObjectId(id)}
      const options = {upsert: true};
      const updateProduct = req.body;
      const Product = {
        $set: {
          title: updateProduct.title,
           description: updateProduct.description,
            marks: updateProduct.marks,
             imgUrl: updateProduct.imgUrl,
             quality: updateProduct.quality,
             date: updateProduct.date
        }
      }

      const result = await assignmentCollection.updateOne(filter, Product, options);
      res.send(result);

    })
    //update information catch
    app.get('/assignment/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await assignmentCollection.findOne(query)
      res.send(result);
    })
    //update end

    app.patch('/assignment/:id',async (req, res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const updatedMarking = req.body
      console.log(updatedMarking)
      const updateDoc = {
        $set: {
         status: updatedMarking.status
        },
      };
      const result = await assignmentCollection.updateOne(filter, updateDoc);
      res.send(result)
    })
//---------------
    app.get('/myassignment/:email',async(req, res)=>{
      
      const userEmail = req.params.email
      
      const result = await assignmentCollection.find({email:userEmail}).toArray()
      res.send(result);
    })

    //-----------
    app.get('/pendingassignment/:status',async (req, res)=>{
      // const pending = req.params.status;
      const result = await assignmentCollection.find({status:('Pending')}).toArray()
      res.send(result)
    })



    //delete
    app.delete('/assignment/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await assignmentCollection.deleteOne(query);
      res.send(result)
    })
    //delete end

    app.get('/assignment/:id', async (req, res) =>{
        const id = req.params.id;
        const query = { _id: new ObjectId(id)}
        const result = await assignmentCollection.findOne(query);
        res.send(result)
    })

   app.post('/assignment' ,async (req, res)=>{
    const newCreator = req.body;
    console.log(newCreator);
    const result = await assignmentCollection.insertOne(newCreator)
    res.send(result);
   })

    // Send a ping to confirm a successful connection


    // await client.db("admin").command({ ping: 1 });

    
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) =>{
    res.send('busy to create assignment')
})

app.listen(port, () =>{
    console.log(`assignment create server is running on port: ${port}`);
})
