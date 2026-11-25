export function createAccountsRepository(database) {
  const findAllStatement = database.prepare(
    'SELECT id, name, description FROM accounts ORDER BY id',
  );
  const findByIdStatement = database.prepare(
    'SELECT id, name, description FROM accounts WHERE id = ?',
  );
  const insertStatement = database.prepare(
    'INSERT INTO accounts (name, description) VALUES (?, ?)',
  );
  const updateStatement = database.prepare(
    'UPDATE accounts SET name = ?, description = ? WHERE id = ?',
  );
  const deleteStatement = database.prepare(
    'DELETE FROM accounts WHERE id = ?',
  );

  return {
    findAll() {
      return findAllStatement.all();
    },
    findById(id) {
      return findByIdStatement.get(id);
    },
    create({ name, description }) {
      const result = insertStatement.run(name, description);
      return findByIdStatement.get(Number(result.lastInsertRowid));
    },
    update(id, { name, description }) {
      const result = updateStatement.run(name, description, id);
      return result.changes ? findByIdStatement.get(id) : null;
    },
    delete(id) {
      return deleteStatement.run(id).changes > 0;
    },
  };
}
