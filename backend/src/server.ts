import app from './app';
import { initializeRAGSystem } from './utils/documentIndexer';
import { vectorStore, indexDocuments } from './services/ragService';
import config from './config';

const PORT = process.env.PORT || 4000;

async function initializeServer() {
  try {
    // Initialize RAG system if enabled
    if (config.RAG_ENABLED) {
      console.log('🚀 Initializing RAG system...');
      
      // Try to load healthcare dataset
      await initializeRAGSystem();
      
      // Add some sample medical documents if vector store is empty
      const currentDocs = vectorStore.getDocuments();
      if (currentDocs.length === 0) {
        console.log('📚 Vector store is empty. Adding sample medical documents...');
        await indexDocuments([
          {
            content: `Diabetes Management Guidelines

Type 2 Diabetes is a chronic condition that affects how your body processes blood sugar (glucose).

Key Symptoms:
- Excessive thirst and frequent urination
- Increased hunger
- Fatigue and blurred vision
- Slow-healing sores or frequent infections
- Unexplained weight loss

Management Strategies:
1. Blood Sugar Monitoring: Check levels regularly as advised by your healthcare provider
2. Medication: Take prescribed medications as directed
3. Diet: Focus on low-carb, high-fiber foods, limit sugar and processed foods
4. Exercise: Aim for 150 minutes per week of moderate-intensity activity
5. Regular Check-ups: Annual eye, foot, and kidney function exams

Warning Signs:
- High blood sugar (hyperglycemia): Excessive thirst, frequent urination, blurred vision
- Low blood sugar (hypoglycemia): Dizziness, confusion, sweating, shakiness

Always consult with a licensed healthcare provider for personalized treatment plans and diagnosis.`,
            metadata: {
              source: "diabetes_guidelines",
              documentType: "guideline",
              section: "endocrinology",
            },
          },
          {
            content: `Hypertension (High Blood Pressure) Information

Hypertension is a common condition where the force of blood against artery walls is consistently too high.

Blood Pressure Categories:
- Normal: Less than 120/80 mmHg
- Elevated: 120-129/less than 80 mmHg
- Stage 1 Hypertension: 130-139/80-89 mmHg
- Stage 2 Hypertension: 140/90 mmHg or higher
- Hypertensive Crisis: Higher than 180/120 mmHg (requires immediate medical attention)

Common Symptoms:
- Often no symptoms (silent condition)
- Headaches (especially in the morning)
- Shortness of breath
- Dizziness or lightheadedness
- Chest pain
- Vision problems

Treatment Approaches:
1. Lifestyle modifications: Reduce sodium intake, increase physical activity, maintain healthy weight
2. Medication: When lifestyle changes are insufficient, medications may be prescribed
3. Regular monitoring: Check blood pressure regularly and attend follow-up appointments
4. Stress management: Practice relaxation techniques

Risk Factors:
- Age, family history, obesity, lack of physical activity, tobacco use, excessive alcohol consumption

Important: Hypertension is often called the "silent killer" because it may have no symptoms. Regular check-ups are essential.`,
            metadata: {
              source: "hypertension_guidelines",
              documentType: "guideline",
              section: "cardiovascular",
            },
          },
          {
            content: `Common Cold and Flu Management

The common cold and influenza (flu) are respiratory illnesses caused by different viruses.

Symptoms:
- Runny or stuffy nose
- Sneezing
- Sore throat
- Cough
- Mild headache
- Low-grade fever (more common in flu)
- Body aches and fatigue (more common in flu)

Self-Care Tips:
1. Rest: Get plenty of sleep to help your body fight the infection
2. Hydration: Drink plenty of fluids (water, herbal tea, broth)
3. Warm salt water gargle: Can help soothe sore throat
4. Humidifier: Use a cool-mist humidifier to ease congestion
5. Over-the-counter medications: Use as directed for symptom relief (decongestants, pain relievers)

When to Seek Medical Care:
- Symptoms lasting more than 10 days
- Severe or persistent fever
- Difficulty breathing or chest pain
- Severe headache or sinus pain
- Symptoms that worsen after initial improvement

Prevention:
- Wash hands frequently with soap and water
- Avoid close contact with sick individuals
- Cover your mouth when coughing or sneezing
- Consider annual flu vaccination

Note: Antibiotics are not effective against colds and flu as they are viral infections.`,
            metadata: {
              source: "respiratory_care",
              documentType: "guideline",
              section: "infectious_diseases",
            },
          },
        ]);
        console.log('✅ Sample medical documents indexed successfully!');
      }
      
      const docCount = vectorStore.getDocuments().length;
      console.log(`✅ RAG system ready with ${docCount} document chunks indexed`);
    } else {
      console.log('ℹ️  RAG system is disabled (RAG_ENABLED=false)');
    }
  } catch (error: any) {
    console.error('⚠️  RAG initialization failed:', error.message);
    console.log('ℹ️  Chatbot will continue without RAG. You can add documents later.');
  }
}

// Initialize server
initializeServer().then(() => {
  app.listen(PORT, () => {
    console.log(`\n✅ Healthcare Chatbot server running on port ${PORT}`);
    console.log(`📡 API endpoints:`);
    console.log(`   - POST /api/chat`);
    console.log(`   - POST /api/upload`);
  });
}).catch((error) => {
  console.error('❌ Server initialization failed:', error);
  process.exit(1);
});
