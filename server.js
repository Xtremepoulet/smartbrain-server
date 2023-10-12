import express from 'express'
import cors from 'cors'
import knex from 'knex'
import bcrypt from 'bcrypt'




const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    port : 5432,
    user : 'postgres',
    password : 'root',
    database : 'smartbraindb'
  }
});





const app = express();


app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors())








app.post('/signin', (request, response) => {

	const { email, password } = request.body

	db.select('hash', 'email').from('login')
		.where('email', '=', request.body.email)
		.then(data => {
			const isValid = bcrypt.compareSync(password, data[0].hash)

			if(isValid){
				return db.select('*').from('users').where('email', '=', email)
				.then(user => {
					response.json(user[0])
				})
			}else {
				response.status(400).json('error not valid')
			}

		}).catch(err => response.status(400).json('error while signin'))




	// database.users.forEach(user => {
	// 	if(email === user.email && password === user.password){
	// 		return response.json(user)
	// 	} 
	// })
})




app.post('/register', (request, response) => {
	const { name, email, password } = request.body;

	const hash = bcrypt.hashSync(password, 2);

	db.transaction(trx => {
		trx.insert({
			hash: hash,
			email, email
		}).into('login')
		.returning('email')
		.then(returningEmail => {
			return trx('users')   //on return la base de donnée users 
			.returning('*')   //on retourne toute les columns
			.insert({   //et on y insere les valeurs 
				name: name,
				email: email,
				joined: new Date(),
				entrie: 0
			}).then(user => {
				response.json(user)   //on renvoie ces valeurs au front end via JSON 
			}).then(trx.commit)  //on met à jour la transaction 
		}).catch(trx.rollback)  //catch error if any 


	}).catch(err => response.status(400).json(err))  //catch error if any (if infos already exists)

})




app.get('/profile/:id', (request, response) => {
	const { id } = request.params;
	
	db.select('*').from('users').where({id})
		.then(user => {
			if(user.length){
				response.json(user[0])
			}else {
				response.status(400).json('user not found')
			}
		}).catch(err => response.json('error while getting user'))
})




app.put('/image', (request, response) => {
	const { id } = request.body
	
	db('users').where('id', '=', id).increment('entrie', 1).returning('entrie')
		.then(entries => response.json(entries[0].entrie))
		.catch(err => response.status(400).json('error while getting entries'))
})




app.listen(3001)