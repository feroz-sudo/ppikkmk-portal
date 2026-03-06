const fs = require('fs');
const path = require('path');

const formsDir = path.join(__dirname, 'src', 'app', 'dashboard', 'forms');
const forms = ['form1', 'form2', 'form3', 'form4', 'form5', 'form6', 'form7', 'form8', 'form11', 'form13'];

forms.forEach(form => {
    const filePath = path.join(formsDir, form, 'page.tsx');
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf-8');

        const oldBlock = `<div className="mt-16 text-center w-full pb-2">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Confidential Document (For Professional Use Only)
                        </p>
                    </div>`;

        const oldBlockForm78 = `<div className="mt-16 text-center w-full pb-2">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Confidential Document (For Professional Use Only)
                        </p>
                    </div>`;

        const newBlock = `<div className="mt-16 text-center w-full pb-2">
                        <p className="inline-block text-xs font-bold text-slate-500 uppercase tracking-widest pl-[0.1em]">
                            Confidential Document (For Professional Use Only)
                        </p>
                    </div>`;

        const oldBlockAlt = `<div className="mt-16 text-center w-full pb-2">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                Confidential Document (For Professional Use Only)
                            </p>
                        </div>`;

        const newBlockAlt = `<div className="mt-16 text-center w-full pb-2">
                            <p className="inline-block text-xs font-bold text-slate-500 uppercase tracking-widest pl-[0.1em]">
                                Confidential Document (For Professional Use Only)
                            </p>
                        </div>`;

        let updated = false;
        if (content.includes(oldBlock)) {
            content = content.replace(oldBlock, newBlock);
            updated = true;
        } else if (content.includes(oldBlockAlt)) {
            content = content.replace(oldBlockAlt, newBlockAlt);
            updated = true;
        } else {
            // Regex replace just in case indentation varies
            const regex = /<div className="mt-16 text-center w-full pb-2">\s*<p className="text-xs font-bold text-slate-500 uppercase tracking-widest">\s*Confidential Document \(For Professional Use Only\)\s*<\/p>\s*<\/div>/g;
            if (regex.test(content)) {
                content = content.replace(regex, newBlock);
                updated = true;
            }
        }

        if (updated) {
            fs.writeFileSync(filePath, content);
            console.log(`Centered footer in ${form}`);
        } else {
            console.log(`Could not find footer block to center in ${form}`);
        }
    }
});
