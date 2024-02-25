function generateInsertQueryForTable(tableName, data) {
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data).map(value => typeof value === 'string' ? `'${value}'` : value).join(', ');
    return `INSERT INTO ${tableName} (${columns}) VALUES (${values});`;
}

function generateSelectQueryWithWhere(tableName, columns = '*', conditions = {}) {
    const columnsString = Array.isArray(columns) ? columns.join(', ') : columns;
    let whereClause = '';
    if (Object.keys(conditions).length > 0) {
        const conditionsArray = [];
        for (const key in conditions) {
            const value = typeof conditions[key] === 'string' ? `'${conditions[key]}'` : conditions[key];
            conditionsArray.push(`${key} = ${value}`);
        }
        whereClause = 'WHERE ' + conditionsArray.join(' AND ');
    }
    return `SELECT ${columnsString} FROM ${tableName} ${whereClause};`;
}

function generateSelectCountQueryWithWhere(tableName, columns = '*', conditions = {}) {
    const columnsString = Array.isArray(columns) ? columns.join(', ') : columns;
    let whereClause = '';
    if (Object.keys(conditions).length > 0) {
        const conditionsArray = [];
        for (const key in conditions) {
            const value = typeof conditions[key] === 'string' ? `'${conditions[key]}'` : conditions[key];
            conditionsArray.push(`${key} = ${value}`);
        }
        whereClause = 'WHERE ' + conditionsArray.join(' AND ');
    }
    return `SELECT COUNT(${columnsString}) FROM ${tableName} ${whereClause};`;
}

function generateUpdateQueryForTable(tableName, data, conditions) {
    const dataEntries = Object.entries(data);
    const conditionEntries = Object.entries(conditions);

    const setData = dataEntries.map(([column, value]) => `${column} = '${value}'`).join(', ');
    const whereData = conditionEntries.map(([column, value]) => `${column} = '${value}'`).join(' AND ');

    return `UPDATE ${tableName} SET ${setData} WHERE ${whereData};`;
}

module.exports = { generateInsertQueryForTable, generateSelectQueryWithWhere, generateSelectCountQueryWithWhere, generateUpdateQueryForTable };