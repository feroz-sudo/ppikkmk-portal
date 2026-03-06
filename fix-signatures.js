const fs = require('fs');
const path = require('path');

const formsDir = path.join(__dirname, 'src', 'app', 'dashboard', 'forms');
const forms = ['form1', 'form2', 'form3', 'form4', 'form5', 'form6', 'form7', 'form8', 'form11', 'form13'];

const replacement = `                    {/* Footer Section */}
                    <div className="pt-10 pb-4 border-t-2 border-dashed border-gray-300 mt-12 w-full max-w-2xl">
                        <div className="mb-6 flex flex-col items-start max-w-sm">
                            <h3 className="text-gray-900 font-bold mb-10">Report by:</h3>
                            <div className="w-80">
                                <div className="border-b-2 border-dashed border-gray-400 w-full mb-2"></div>
                                <div className="flex justify-between items-center w-full px-1">
                                    <span className="text-gray-800 font-medium">(</span>
                                    <input
                                        required
                                        type="text"
                                        value={counselorName}
                                        onChange={e => setCounselorName(e.target.value)}
                                        className="bg-transparent outline-none flex-1 text-center font-bold text-gray-800 placeholder-gray-400 py-1"
                                        placeholder="Your Name"
                                    />
                                    <span className="text-gray-800 font-medium">)</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-gray-700 text-sm space-y-1 font-bold">
                            <p>CMCH Counselor Trainee</p>
                            <p className="font-normal">Universiti Pendidikan Sultan Idris</p>
                            <p className="font-normal">35900 Tanjong Malim, Perak</p>
                        </div>

                        <div className="mt-16 text-center w-full pb-2">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                Confidential Document (For Professional Use Only)
                            </p>
                        </div>
                    </div>`;

forms.forEach(form => {
    const filePath = path.join(formsDir, form, 'page.tsx');
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf-8');

        const startRegex = /\{\/\*\s*Footer Section\s*\*\/\}/;
        const startMatch = content.match(startRegex);

        if (startMatch) {
            const startIndex = startMatch.index;
            // The block ends right before <div className="pt-6 border-t border-gray-200 OR </form>
            let endMatch = content.substring(startIndex).match(/<div className="pt-6 border-t/);
            if (!endMatch) {
                endMatch = content.substring(startIndex).match(/<\/form>/);
            }

            if (endMatch) {
                const endIndex = startIndex + endMatch.index;
                const oldBlock = content.substring(startIndex, endIndex);

                content = content.replace(oldBlock, replacement + '\n\n                    ');
                fs.writeFileSync(filePath, content);
                console.log(`Updated ${form}`);
            } else {
                console.log(`Could not find end of signature block in ${form}`);
            }
        } else {
            console.log(`Could not find Footer Section in ${form}`);
        }
    } else {
        console.log(`${form} not found.`);
    }
});
