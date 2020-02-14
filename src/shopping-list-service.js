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
    
    getById(db,id) {
        return db('shopping_list')
            .select('*')
            .where({ id })
            .first();
    },

    deleteItem(db, id) {
        return db('shopping_list')
          .where({ id })
          .delete();
      },
    
    updateItem(db, id, data) {
        return db('shopping_list')
            .where({ id })
            .update(data);
    }
}

module.exports = ShoppingListService;