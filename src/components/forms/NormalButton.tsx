import React from "react";
import { CheckCircle } from "lucide-react";

interface NormalButtonProps {
    clientName: string;
    onFill: (text: string) => void;
}

export const NormalButton: React.FC<NormalButtonProps> = ({ clientName, onFill }) => {
    const normalText = `The client, ${clientName || 'the client'}, presented alert and oriented x3. Appearance was appropriate for the setting, and hygiene was within normal limits. Behavior was cooperative and speech was clear, coherent, and of normal rate and tone. Mood was euthymic with a congruent, broadly reflective affect. Thought processes were logical and goal-directed. No overt evidence of psychosis, perceptual disturbances, or active suicidal/homicidal ideations were observed at the time of the session. Insight and judgment appeared fair to good.`;

    return (
        <button
            type="button"
            onClick={() => onFill(normalText)}
            className="flex items-center space-x-2 bg-green-50 border border-green-300 text-green-700 font-semibold px-4 py-2 rounded-lg hover:bg-green-100 active:bg-green-200 transition-colors shadow-sm ml-auto"
            title="Autofill standard 'Within Normal Limits' observation."
        >
            <CheckCircle size={16} />
            <span>WNL (Normal Limits)</span>
        </button>
    );
};
