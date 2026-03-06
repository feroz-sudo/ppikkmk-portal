const fs = require('fs');
const path = require('path');

const formsDir = path.join(__dirname, 'src', 'app', 'dashboard', 'forms');
const forms = ['form2', 'form3', 'form4', 'form5', 'form6', 'form11', 'form13'];

forms.forEach(form => {
    const filePath = path.join(formsDir, form, 'page.tsx');
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf-8');

        // Target specifically the signature block parent
        const targetClass = 'pt-10 pb-4 border-t-2 border-dashed border-gray-300 mt-12 w-full max-w-2xl';
        const newClass = 'pt-10 pb-4 border-t-2 border-dashed border-gray-300 mt-12 w-full';

        if (content.includes(targetClass)) {
            content = content.replace(targetClass, newClass);
            fs.writeFileSync(filePath, content);
            console.log(`Unconstrained footer width in ${form}`);
        } else {
            console.log(`Could not find target class in ${form}`);
        }
    }
});
