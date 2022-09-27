const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5001

// middleware 
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.z9wyg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
    try{
      await client.connect()
      const productCollection = client.db('emaJohn').collection('product')

      app.get('/product', async(req, res)=>{
          console.log('query', req.query)
          const page = parseInt(req.query.page)
          const size = parseInt(req.query.size) 
          const query = {}
          const cursor = productCollection.find(query)
          let products;
          if(page || size){
            products = await cursor.skip(page * size).limit(size).toArray()
          }else{
            products = await cursor.toArray()
          }
          res.send(products)
      })
      app.get('/productCount', async(req, res)=>{
          const count = await productCollection.estimatedDocumentCount()
          res.send({count})
      })
      app.get('/product/:id', async(req, res)=>{
          const id = req.params.id 
          const query = {_id:ObjectId(id)}
          const product = await productCollection.findOne(query)
          res.send(product)
      })
      app.post('/products', async(req, res)=>{
          const productDoc = req.body
          console.log(productDoc)
          const product = await productCollection.insertOne(productDoc)
          res.send(product)
      })
      //use post to get product by ids
      app.post('/productByIds', async(req, res)=>{
          const keys = req.body;
          const ids = keys.map(id => ObjectId(id))
          const query = {_id:{$in:ids}}
          const cursor = productCollection.find(query)
          const products = await cursor.toArray()
          res.send(products)
      })
      
      app.delete('/product/:id', async(req, res)=>{
          const id = req.params.id 
          const query = {_id:ObjectId(id)}
          const product = await productCollection.deleteOne(query)
          res.send(product)
      })
    }
    finally{

    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('john is running for ema')
})
app.listen(port, () => {
    console.log('listening ema john', port)
})