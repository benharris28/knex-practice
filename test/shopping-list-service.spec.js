const knex = require('knex');
const ShoppingListService = require('../src/shopping-list-service');

describe('Shopping list service object', () => {
    // this is the main describe
    let db;

    const testItems = [
        {
            id: 1,
            name: 'Test item',
            price: '12.12',
            date_added: new Date('2019-04-03 07:00:00'),
            checked: false,
            category: 'Snack',
        },
        {
            id: 2,
            name: 'Second item',
            price: '14.12',
            date_added: new Date('2019-05-03 07:00:00'),
            checked: false,
            category: 'Main',
        }
    ];

    //setup the database connection before we run the tests
    before('setup db', () => {
        db = knex({
          client: 'pg',
          connection: process.env.TEST_DB_URL,
        });
      });
    
    // Before all tests run and after each individual test, empty the
    // shopping_list table
    before('clean db', () => db('shopping_list').truncate());
    afterEach('clean db', () => db('shopping_list').truncate());
    
    // After all tests run, let go of the db connection
    after('destroy db connection', () => db.destroy());

    describe('getAllItems()', () => {
        it('returns an empty array', () => {
          return ShoppingListService
            .getAllItems(db)
            .then(shoppingList => expect(shoppingList).to.eql([]));
        });

        // Whenever we set a context with data present, we should always include
        // a beforeEach() hook within the context that takes care of adding the
        // appropriate data to our table
        context('with data present', () => {
        beforeEach('insert test items', () =>
          db('shopping_list')
            .insert(testItems)
        );
        
        it('returns all test items', () => {
            return ShoppingListService
              .getAllItems(db)
              .then(shoppingList => expect(shoppingList).to.eql(testItems));
          });
        });
    
    });

    describe('insertItem()' , () => {
        it('inserts record in db and returns item with new id', () => {
          // New item to use as subject of our test
          const newItem = {
            name: 'Test item',
            price: '14.12',
            date_added: new Date('2019-06-03 07:00:00'),
            checked: false,
            category: 'Main',
          };
    
          return ShoppingListService.insertItem(db, newItem)
            .then(actual => {
              expect(actual).to.eql({
                id: 1,
                name: newItem.name,
                price: newItem.price,
                date_added: newItem.date_added,
                checked: newItem.checked,
                category: newItem.category
              });
            });
        });
    
        it('throws not-null constraint error if title not provided', () => {
            // Subject for the test does not contain a `title` field, so we
            // expect the database to prevent the record to be added      
            const newItem = {
               
                price: '14.12',
                date_added: new Date('2019-06-03 07:00:00'),
                checked: false,
                category: 'Main',
              };
            
              return ShoppingListService 
                .insertItem(db, newItem)
                .then(
                    () => expect.fail('db should throw error'),
                    err => expect(err.message).to.include('not-null')
                );
            });
    
         
        });
     
    
        describe('getById()', () => {
            it('should return undefined', () => {
              return ShoppingListService
                .getById(db, 999)
                .then(item => expect(item).to.be.undefined);
            });

            context('with data present', () => {
                before('insert item', () => 
                  db('shopping_list')
                    .insert(testItems)
                );
          
                it('should return existing item', () => {
                  const expectedItemId = 3;
                  const expectedItem = testItems.find(i => i.id === expectedItemId);
                  return ShoppingListService.getById(db, expectedItemId)
                    .then(actual => expect(actual).to.eql(expectedItem));
                });
              });

        });
    
        describe('deleteItem()', () => {
            it('should return 0 rows affected', () => {
              return ShoppingListService
                .deleteItem(db, 999)
                .then(rowsAffected => expect(rowsAffected).to.eq(0));
            });

            context('with data present', () => {
                before('insert items', () => 
                  db('shopping_list')
                    .insert(testItems)
                );

                it('should return 1 row affected and record is removed from db', () => {
                    const deletedItemId = 1;

                return ShoppingListService
                    .deleteItem(db, deletedItemId)
                    .then(rowsAffected => {
                        expect(rowsAffected).to.eq(1);
                        return db('shopping_list').select('*');
                    })
                    .then(actual => {
                    // copy testItems array with id 1 filtered out
                    const expected = testItems.filter(a => a.id !== deletedItemId);
                    expect(actual).to.eql(expected);
                    });

            });

        });
    });

    describe('updateItem()', () => {
        it('should return 0 rows affected', () => {
          return ShoppingListService
            .updateItem(db, 999, { name: 'new name!' })
            .then(rowsAffected => expect(rowsAffected).to.eq(0));
        });
        
        context('with data present', () => {
            before('insert items', () => 
              db('shopping_list')
                .insert(testItems)
            );
        
            it('should successfully update an item', () => {
                const updatedItemId = 1;
                const testItem = testItems.find(a => a.id === updatedItemId);
                // make copy of testArticle in db, overwriting with newly updated field value
                const updatedItem = { ...testItem, name: 'New name!' };
        
                return ShoppingListService
                  .updateItem(db, updatedItemId, updatedItem)
                  .then(rowsAffected => {
                    expect(rowsAffected).to.eq(1)
                    return db('shopping_list').select('*').where({ id: updatedItemId }).first();
                  })
                  .then(item => {
                    expect(item).to.eql(updatedItem);
                  });
                });

        });
    });
})