// Class 8 AI chapters: CBSE exercises with the Teacher Handbook's solutions.
import { A, type AiExercise } from "./types";

export const AI8: AiExercise[] = [
  A({
    chapter: 1,
    mcq: [
      ["AI learns from:", ["Magic", "Luck", "Data", "Guessing"], 2],
      ["In spam detection, the AI problem is to:", ["Send emails", "Write emails", "Delete all emails", "Identify spam emails"], 3],
      ["The first stage of a project cycle is:", ["Defining the problem", "Data collection", "Model development", "Model deployment"], 0],
      ["If an AI model correctly identifies 8 out of 10 spam emails, the accuracy of the model is:", ["50%", "20%", "80%", "100%"], 2],
      ["An AI model improves because:", ["It thinks like a human", "It has feelings", "It gets new data added", "It gets angry"], 2],
    ],
    fill: [
      ["AI learns by finding _____ in data.", ["patterns"]],
      ["An AI project follows a _____ cycle.", ["project"]],
      ["Spam emails often contain suspicious _____.", ["words", "links"]],
      ["After testing, we _____ the system.", ["improve"]],
      ["AI cannot work without _____.", ["data"]],
    ],
    short: [
      ["How does AI learn?", "AI learns by analysing data and finding patterns to make predictions."],
      ["Why is defining the problem important in an AI project?", "It helps us understand what the AI system needs to solve and guides data collection."],
      ["What happens in the testing stage of an AI project?", "The AI model is checked using test data to measure its accuracy and performance."],
      ["What is meant by accuracy in AI?", "Accuracy is how correctly the AI predicts results. Example: 8 correct out of 10 = 80% accuracy."],
      ["Give one real-life example of an AI project.", "A spam email detection system."],
    ],
    apply: [
      ["Imagine you are building an AI system to detect fake news. What would you do at each stage: define the problem, collect data, test AI tools, reflect and improve?",
        "Define the problem: detect fake news articles.\nCollect data: collect real and fake news examples.\nTest AI tools: check if the AI correctly identifies fake news.\nReflect and improve: add more data and improve accuracy."],
      ["An online shop's AI learned that a delivery is on time if the distance is less than 10 km, the weather is clear, traffic is low and the delivery partner is experienced. Predict the status of O5 (8 km, Clear, Low traffic, Experienced partner) and O6 (18 km, Rainy, High traffic, New partner).",
        "O5: On Time. O6: Late."],
    ],
  }),
  A({
    chapter: 2,
    mcq: [
      ["AI helps in environmental protection by:", ["Tracking wildlife populations", "Predicting pollution levels", "Detecting plastic waste", "All of the above"], 3],
      ["No-code AI tools allow users to:", ["Program AI models using coding", "Train AI models without coding", "Only analyse text data", "Replace teachers completely"], 1],
      ["AI can predict future health risks by analysing a patient's:", ["Favourite movies", "Medical history and lifestyle habits", "Social media posts", "Travel destinations"], 1],
      ["Which environmental problem can AI help solve by analysing satellite images of rivers and oceans?", ["Soil degradation", "Plastic pollution", "Air pollution", "Water shortage"], 1],
      ["An example of AI in smart homes is:", ["Self-driving cars", "Voice-controlled appliances", "Tracking wildlife populations", "Predicting diseases"], 1],
    ],
    fill: [
      ["AI-powered _____ can answer health questions and remind patients to take medicines.", ["chatbots"]],
      ["Satellites and sensors help AI detect _____ pollution in oceans and rivers.", ["plastic"]],
      ["AI in education can provide _____ learning tailored to each student's needs.", ["personalised", "personalized"]],
      ["Wearable devices allow AI to perform _____ patient monitoring.", ["continuous"]],
      ["Platforms like _____ allow students to train AI models without coding.", ["Teachable Machine"]],
    ],
    short: [
      ["Name two ways AI helps in reducing environmental problems.", "Detecting plastic waste in oceans; monitoring wildlife populations."],
      ["How does AI assist doctors in medical diagnosis?", "AI analyses medical images, patient history and symptoms to detect diseases early."],
      ["Give one example of AI application in smart homes.", "Voice-controlled lights or smart assistants that control appliances."],
      ["What is the benefit of personalised learning in education?", "Students learn at their own pace based on their strengths and weaknesses."],
      ["Explain the role of AI in agriculture.", "AI helps farmers predict weather, monitor crops, detect diseases and improve yield."],
    ],
    apply: [
      ["Design a simple AI project using a no-code platform to help sort waste in your school. What steps would you follow?", "Define the problem (sort recyclable and non-recyclable waste); collect data (images of different waste items); train the model with a no-code tool; test it with new waste images; improve it by adding more data."],
      ["How can AI predict and prevent water shortages in your area?", "AI analyses rainfall data, water usage and weather patterns to predict shortages and suggest ways to save water."],
      ["Suggest a way AI could help students struggling with mathematics.", "An AI tutor can give step-by-step solutions and personalised practice questions."],
      ["If you were a farmer, how would you use AI to improve crop production and protect soil health?", "Use AI to predict weather, suggest the best crops, monitor soil moisture and detect plant diseases."],
    ],
  }),
  A({
    chapter: 3,
    mcq: [],
    fill: [],
    short: [],
    apply: [
      ["In the Teachable Machine activity, the cat training set had about 15 images and the dog training set about 7–8. Which class did the classifier work better on, and why?", "Cats, because the training data had more cat images than dog images."],
      ["After re-curating the training data so that cats and dogs have an equal number of images, how does the new classifier compare?", "It works about the same for both cats and dogs, because the training dataset is now balanced."],
    ],
  }),
  A({
    chapter: 4,
    mcq: [
      ["AI ethics focuses on:", ["Making machines faster", "Making machines cheaper", "Ensuring responsible use", "Deleting apps"], 2],
      ["Privacy means:", ["Sharing everything online", "Protecting personal information", "Hiding from society", "Deleting apps"], 1],
      ["AI bias can occur when:", ["AI systems are turned off", "Data used for training is incomplete or unfair", "Computers are slow", "The internet is not working"], 1],
      ["Before sharing information online, what should you do?", ["Share it quickly", "Think about why the information is needed", "Forward it to everyone", "Ignore the message"], 1],
      ["AI systems learn patterns from:", ["Books", "Data", "Games", "Images"], 1],
    ],
    fill: [
      ["Misinformation means _____ information.", ["false", "incorrect"]],
      ["Fair AI systems treat people _____.", ["equally", "fairly"]],
      ["Humans must remain _____ for AI decisions.", ["responsible", "accountable"]],
      ["Incorrect or misleading information shared online is called _____.", ["misinformation"]],
    ],
    short: [
      ["Why is privacy important in the digital world?", "Privacy protects personal information from misuse and keeps users safe online."],
      ["Give one example of misinformation.", "A fake message saying school is closed when it is actually open."],
      ["What does accountability mean in AI systems?", "Accountability means humans are responsible for decisions made using AI."],
      ["What is AI ethics?", "AI ethics are rules that ensure AI is used fairly, safely and responsibly."],
      ["Why is human supervision important when AI systems are used?", "Humans check AI decisions to prevent mistakes and unfair outcomes."],
    ],
    apply: [
      ["A student installs an app that asks for permission to access location, contacts and photos. The student pauses and thinks about why the app needs this information. What important digital habit is the student practising?", "Thinking before sharing personal data (protecting privacy)."],
      ["An AI system used in healthcare suggests that a patient has a high-risk level. Doctors carefully review the AI's recommendation before making a final decision. Why is human review important in this situation?", "To verify the AI's results and avoid incorrect medical decisions."],
      ["An AI system is trained mostly with data from one city and later used in other places. It does not work well for people from different regions. What problem in AI does this example show?", "AI bias (data bias)."],
      ["A message spreads quickly on social media, but the information in it is incorrect. What is this situation called, and what should users do before sharing such messages?", "This is misinformation. Users should verify the information before sharing."],
    ],
    tables: [
      { title: "One-word challenge: which word matches the description?", choices: ["Privacy", "Misinformation", "Bias", "Ethics", "Accountability"], rows: [
        ["Protection of personal information", "Privacy"], ["Incorrect or misleading information shared online", "Misinformation"], ["Unfair patterns learned by AI from data", "Bias"],
        ["Moral principles guiding technology use", "Ethics"], ["Responsibility for AI decisions", "Accountability"],
      ] },
    ],
  }),
];
