async function getRelatedQuestionsAI(question, mode) {
    const roleText = mode === 'docente' ? 'docente de educación inclusiva' : 'estudiante de primaria';
    const prompt = `Eres un ${roleText}. Dada la pregunta del usuario: "${question}", genera exactamente 6 temas o preguntas de seguimiento relacionadas, útiles y en español. Devuelve ÚNICAMENTE un JSON válido con el siguiente formato: ["tema 1", "pregunta 2", "tema 3", ...]. No incluyas texto adicional, explicaciones, ni la pregunta original. Asegúrate de que el JSON sea sintácticamente correcto.`;    const text = await askAIServer(prompt);
    return tryParseSuggestions(text, { topic: question, mode });
}
