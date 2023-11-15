const { query } = require('express');
const {createPool} = require('mysql')

//Mysql database connection module using "createpool" that is used to do parrallel database queries
const pool = createPool({
    host : "localhost",
    user : "root",
    password : "root123", // We changed the original password to connect with db.
    database:'fastoodb',
    connectionLimit: 10,

})

//Retriving data from the DBMS
const RetriveData = async (id) => {
    // Retrieving Data from DB
    console.log(`Id = ${id}`);
    //Query
    const select_users = `SELECT * FROM users WHERE user_id = ${id};`;
    try {
        const result = await new Promise((resolve, reject) => {
            pool.query(select_users, (err, res, fields) => {
                if (err) {
                    console.log('DATABASE ERR : ' + err);
                    reject(err);
                } else {
                    // Resolve the Promise with the retrieved data
                    resolve(res); //reslove means telling something(data) is returned to the promise
                }
            });
        });
        return result;
    } 
    catch (err) {
        console.log(`ERROR Occurred : ${err}`);
        throw err;
    }
};

/* const RetriveData = () => {
    return new Promise((resolve, reject) => {
        // Retrieving Data from DB
        console.log(`function called...`);
        pool.query(select_users, (err, res, fields) => {
            if (err) {
                console.log('DATABASE ERR : ' + err);
                reject(err);
            } else {
                // The "res" retrieved result from MySQL is an array of Objects
                const Rdata = res;
                resolve(Rdata);
            }
        });
    });
}; */

//Login User credentials check
async function credentialsCheck(username) {
    const check_query = `SELECT user_pwd FROM allUsers WHERE user_name='${username}';`;

//Here we used "new promise(res,rej){...}" to control the overall async pool.query and give output.
    return new Promise((resolve, reject) => {
        pool.query(check_query, (err, res) => {
            if (err) {
                reject('Error querying the database');
            } else {
                if (res.length === 0) {
                    reject('User not found');
                } else {
                    console.log('User Found = ', res);
                    console.log(`Pass = ${res[0].user_pwd}`);
                    const result = res[0].user_pwd;
                    resolve(result);
                }
            }
        });
    });
}




//Inserting Data into DB
const InsertData = (username, password, mail) => {
    //query in separate variable
    q1 = `INSERT INTO allUsers(user_name,user_pwd,user_mail) VALUES ('${username}', '${password}', '${mail}');`

    pool.query(q1, (err, res) => {
        if(err){
                return console.log('DATABASE ERR : '+err);            
        }
        return console.log("Data Inserted Successfully");
    })
}

const cost = 1000

exports.Rcost = cost;
exports.Rfun= RetriveData;

exports.retriveData = RetriveData;
exports.insertData = InsertData;
exports.credentialsCheck = credentialsCheck;