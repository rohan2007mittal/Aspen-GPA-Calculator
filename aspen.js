const puppeteer = require('puppeteer');
// const username = 'rohan.mittal@greenwichschools.org';
// const password = "H0r!z0n123";

const readline = require('readline');

function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}


(async () => {
    const username = await askQuestion("Username: ");
    const password = await askQuestion("Password: ");

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate to Aspen by Follett login page
    await page.goto('https://ct-greenwich.myfollett.com/aspen/logon.do');

    // Enter login credentials
    await page.type('#username', username);
    await page.type('#password', password);

    // Click the login button
    await page.click('button[type="submit"]');

    // Wait for the page to load
    await page.waitForNavigation();

    // Navigate to the grades page
    await page.goto('https://ct-greenwich.myfollett.com/aspen/portalClassList.do?navkey=academics.classes.list');

    // Scrape the grade data from the page
    const classes = await page.evaluate(() => {
        // gets only the table rows with classes in them
        const rows = document.querySelectorAll('table tr.listCell');
        return Array.from(rows, row => {
        const columns = row.querySelectorAll('td');
        
        return Array.from(columns, column => column.innerText);
        });
    });
    
    // consolidate info into a new table
        let grades = []
        for (let i = 0; i < classes.length; i++) {
            // pushing class, teacher, room, grade
            grades.push([classes[i][2], classes[i][5], classes[i][6], classes[i][7]])
        }
        // Print the grade data to the console
        console.table(grades);

    // calculate current GPA
        let floatedGrades = [];
        let honors = 0;
        let letterGrade;
        for (let i = 0; i < grades.length; i++) {
            if (grades[i][0].includes("HONORS") || grades[i][0].includes("HON ") || grades[i][0].includes("AP ")) honors = 1;
            else honors = 0;
            if (isNaN(grades[i][3].substring(0, grades[i][3].indexOf(' ')))) continue;
            else if (grades[i][0].includes("PE") || grades[i][0].includes("SEM") || grades[i][0].includes("HEALTH") || grades[i][0].includes("SPORTS")) continue;
            
            letterGrade = grades[i][3].substring(grades[i][3].indexOf(' ') + 1, grades[i][3].length);
            switch (letterGrade) {
                case 'A+':
                    floatedGrades.push(4.33 + honors)
                    break;
                case 'A':
                    floatedGrades.push(4.00 + honors)
                    break;
                case 'A-':
                    floatedGrades.push(3.66 + honors)
                    break;
                case 'B+':
                    floatedGrades.push(3.33 + honors)
                    break;
                case 'B':
                    floatedGrades.push(3.00 + honors)
                    break;
                case 'B-':
                    floatedGrades.push(2.66 + honors)
                    break;
                case 'C+':
                    floatedGrades.push(2.33 + honors)
                    break;
                case 'C':
                    floatedGrades.push(2.00 + honors)
                    break;
                case 'C-':
                    floatedGrades.push(1.66 + honors)
                    break;
                case 'D+':
                    floatedGrades.push(1.33 + honors)
                    break;
                case 'D':
                    floatedGrades.push(1.00 + honors)
                    break;
                case 'D-':
                    floatedGrades.push(0.66 + honors)
                    break;
                case 'F':
                    floatedGrades.push(0)
                    break;
                }
            }
        // average the GPA
        let total = 0;
        for(let i = 0; i < floatedGrades.length; i++) {
            total += floatedGrades[i];
        }
        let average = total / floatedGrades.length;
        

        console.log("Current GPA: "+ average);

    // Close the browser
    await browser.close();
    })();
