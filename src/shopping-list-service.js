const ShoppingListService = {
    getAllItems(db) {
      return db('shopping_list')
        .select('*');
    },
    insertItem(db, data) {
        //note to ask mentor what rows is doing
        return db('shopping_list')
          .insert(data)
          .returning('*')
          .then(rows => rows[0]);
      },
}

module.exports = ShoppingListService;