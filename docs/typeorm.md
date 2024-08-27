## repository.save() and repository.update() bug:
If you try to pass undefined values to save method, they will not be updated, 
whereas in update if the column is nullable it will be set to null, otherwise it will throw an error.