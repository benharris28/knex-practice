require('dotenv').config()
const knex = require('knex')

const knexInstance = knex({
  client: 'pg',
  connection: process.env.DB_URL
})


function searchShoppingList(searchTerm) {
    knexInstance
        .select('name')
        .from('shopping_list')
        .where('name', 'ILIKE', `%${searchTerm}%`)
        .then(result => {
            console.log(result)
        })
}

searchShoppingList('fish')


function paginate(pageNumber) {
    const productsPerPage = 6
    const offset = productsPerPage * (pageNumber - 1)
    knexInstance
        .select('*')
        .from('shopping_list')
        .limit(productsPerPage)
        .offset(offset)
        .then(result => {
            console.log('Paginate', { pageNumber })
            console.log(result)
        })

}

paginate(2)


function itemsAfterDate(daysAgo) {
    knexInstance
        .select('name', 'price', 'category', 'date_added')
        .from('shopping_list')
        .where('date_added', '>',
            knexInstance.raw(`now() - '?? days'::INTERVAL`, daysAgo))
        .then(results => {
            console.log('PRODUCTS ADDED DAYS AGO')
            console.log(results)
        })
}

itemsAfterDate(10)

function totalCost() {
    knexInstance
    .select('category')
    .sum('price as total_cost')
    .from('shopping_list')
    .groupBy('category')
    .then(result => {
        console.log('Total Cost')
        console.log(result)
    })
}

totalCost()