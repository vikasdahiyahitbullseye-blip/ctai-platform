// Class 7 AI chapters: CBSE exercises with the Teacher Handbook's solutions.
import { A, type AiExercise } from "./types";

export const AI7: AiExercise[] = [
  A({
    chapter: 1,
    mcq: [
      ["Which AI technique predicts numerical values?", ["Classification", "Clustering", "Regression", "Detection"], 2],
      ["Which AI domain works with images and videos?", ["NLP", "Data Science", "Computer Vision", "Science"], 2],
      ["Clustering is mainly used to:", ["Predict marks", "Group similar data", "Translate language", "Detect spam"], 1],
      ["In classification, the output is:", ["A continuous value", "A predefined category", "A random number", "A chart"], 1],
      ["In dataset division, which data is used for final evaluation?", ["Training", "Validation", "Test", "Raw data"], 2],
    ],
    fill: [
      ["Regression predicts _____ values.", ["continuous", "numerical"]],
      ["Clustering does not require _____ data.", ["labelled", "labeled"]],
      ["Computer Vision works mainly with _____ and videos.", ["images"]],
      ["NLP helps machines understand _____.", ["language", "human language"]],
      ["A dataset is divided into training, validation, and _____ sets.", ["test"]],
    ],
    short: [
      ["Differentiate between classification and regression.", "Classification predicts categories (spam / not spam); regression predicts numerical values (price, marks)."],
      ["What is clustering? Give one example.", "Clustering is grouping similar data without labels. Example: grouping customers based on shopping habits."],
      ["Explain the importance of datasets in AI.", "Datasets help AI systems learn patterns and make predictions. Better datasets improve model accuracy."],
      ["List the steps involved in Computer Vision.", "Image collection, image pre-processing, feature extraction, model training, prediction."],
      ["How does NLP help in communication systems?", "NLP helps machines understand human language. Examples: chatbots, translation, voice assistants."],
    ],
    apply: [],
    tf: [
      ["Regression predicts categories.", false],
      ["Clustering is a supervised learning method.", false],
      ["Test data is used to evaluate model performance.", true],
      ["Computer Vision can detect object locations.", true],
      ["NLP can analyse sentiment in text.", true],
    ],
    tables: [
      { title: "Identify the AI domain", choices: ["Computer Vision", "NLP", "Data Science"], rows: [
        ["Analysing MRI scans", "Computer Vision"], ["Text summarization of long articles", "NLP"], ["Recommending products based on past purchases", "Data Science"],
        ["Grouping customers by buying behaviour", "Data Science"], ["Chatbots answering customer queries", "NLP"],
      ] },
    ],
  }),
  A({
    chapter: 2,
    mcq: [
      ["Artificial Intelligence mainly helps industries to become:", ["Traditional", "Efficient", "Slow", "Manual"], 1],
      ["In healthcare, AI mainly helps in:", ["Diagnosis", "Advertising", "Packaging", "Decoration"], 0],
      ["In education, AI provides:", ["Cancelling classes", "Personalised learning", "Reducing learning", "Extra homework"], 1],
      ["In transport systems, AI is used to:", ["Manage traffic", "Increase traffic congestion", "Stop route planning", "Remove public transport"], 0],
      ["AI supports better decision-making by:", ["Ignoring available data", "Analysing large amounts of data", "Making random guesses", "Avoiding pattern recognition"], 1],
    ],
    fill: [
      ["AI-powered machines help doctors detect diseases at an _____ stage.", ["early"]],
      ["Robotic surgery can make complex operations _____ and reduce recovery time.", ["precise", "more precise"]],
      ["AI learning programs can understand how each student _____ best.", ["learns", "learn"]],
      ["Traffic control systems use _____ and cameras to monitor vehicles on roads.", ["sensors"]],
      ["AI translation tools help people understand different _____.", ["languages"]],
    ],
    short: [
      ["How does AI help in healthcare?", "AI helps doctors detect diseases early, analyse medical images, and assist in robotic surgery."],
      ["Explain how AI supports personalised learning in education.", "AI tracks student performance and adjusts lessons based on each student's learning speed."],
      ["How does AI improve transport systems?", "AI manages traffic signals, predicts congestion, and suggests the best routes."],
      ["Mention two advantages of using AI in industries.", "It improves efficiency and reduces human error."],
      ["How does AI improve customer service?", "AI chatbots answer questions instantly and provide 24/7 support."],
    ],
    apply: [],
    tf: [
      ["AI can help doctors detect diseases at an early stage.", true],
      ["AI completely replaces teachers in classrooms.", false],
      ["AI helps traffic systems manage congestion.", true],
      ["AI cannot analyse large amounts of data quickly.", false],
      ["AI improves communication by reducing background noise in online meetings.", true],
    ],
    tables: [
      { title: "Identify the field of the AI application", choices: ["Healthcare", "Education", "Transport", "Communication / email filtering", "Business automation"], rows: [
        ["Analysing MRI scans", "Healthcare"], ["Giving instant quiz feedback", "Education"], ["Controlling traffic lights", "Transport"],
        ["Blocking spam emails", "Communication / email filtering"], ["Managing inventory and energy use", "Business automation"],
      ] },
    ],
  }),
  A({
    chapter: 3,
    mcq: [
      ["Which of the following is an example of structured data?", ["Social media posts", "Audio recordings", "Student marks in a table", "Videos"], 2],
      ["Which method of data collection involves carefully watching and recording information?", ["Survey", "Measurement", "Observation", "Digital collection"], 2],
      ["Which type of graph is best used to show changes over time?", ["Pie chart", "Line graph", "Bar chart", "Table"], 1],
      ["Before creating charts, data should first be:", ["Deleted", "Randomly arranged", "Cleaned and organised", "Converted into videos"], 2],
      ["Which of the following is an example of unstructured data?", ["Student marks in a table", "Attendance record", "Audio recording", "Sales data in a spreadsheet"], 2],
    ],
    fill: [
      ["Data visualization transforms data into a _____ form such as charts or graphs.", ["visual"]],
      ["A database stores data in _____ and columns.", ["rows"]],
      ["Unstructured data includes _____ and videos.", ["images"]],
      ["Accuracy refers to how close a measurement is to the _____ value.", ["true", "actual", "correct"]],
      ["A pattern is something that appears _____ in the data.", ["repeatedly"]],
    ],
    short: [
      ["What is data? Give two examples.", "Data is raw facts or information. Examples: student marks, temperature readings."],
      ["Differentiate between structured and unstructured data.", "Structured data is organised in rows and columns and is easy to analyse (e.g. a marks table). Unstructured data is not organised and is harder to analyse (e.g. videos, audio)."],
      ["Why is data format important?", "Data format helps organise information properly and makes analysis easier."],
      ["What steps are involved in preparing data for visualization?", "Collect data, clean data, organise data, remove duplicates, create the chart."],
      ["Explain the difference between precision and accuracy with an example.", "Accuracy: values close to the true value. Precision: repeated values close to each other. If the actual value is 50, readings 49, 50, 51 are accurate; readings 45, 45, 45 are precise (but not accurate)."],
    ],
    apply: [],
    tf: [
      ["Pie charts show how data changes over time.", false],
      ["Structured data is easy to search and analyse.", true],
      ["Valid data must be both accurate and precise.", true],
      ["Observation is a method of data collection.", true],
      ["Extra digits added during processing may reduce meaningful precision.", true],
    ],
    tables: [
      { title: "Identify the skill used", choices: ["Data Collection", "Data Organisation", "Data Analysis", "Data Visualization", "Data Cleaning"], rows: [
        ["A student counts how many classmates come to school by bus.", "Data Collection"],
        ["The cricket team captain arranges match scores in rows and columns.", "Data Organisation"],
        ["A student studies a line graph and concludes that marks improved over time.", "Data Analysis"],
        ["A pie chart is created to show favourite sports in the class.", "Data Visualization"],
        ["Duplicate entries are removed before preparing a chart.", "Data Cleaning"],
      ] },
    ],
  }),
  A({
    chapter: 4,
    mcq: [
      ["Which of the following is an example of structured data?", ["Video footage", "A table of student marks in a spreadsheet", "A written paragraph", "A collection of photos in a gallery"], 1],
      ["AI bias mainly comes from:", ["Equal results for all", "Wrong math answer", "Fast internet", "Facial recognition errors for darker skin"], 3],
      ["Human-in-the-Loop (HITL) means:", ["AI decides alone", "Humans check final decisions", "No monitoring", "AI ignores humans"], 1],
      ["Which principle protects personal data?", ["Fairness", "Transparency", "Privacy", "Speed"], 2],
      ["Which is a responsibility of a digital citizen?", ["Spread rumours", "Share passwords", "Verify information", "Hack accounts"], 2],
    ],
    fill: [
      ["Ethics guide us to be fair and _____.", ["responsible"]],
      ["AI systems learn patterns from _____.", ["data"]],
      ["Using _____ and balanced data helps reduce bias.", ["diverse"]],
      ["Digital users have the right to _____.", ["privacy", "safety"]],
      ["Human-in-the-Loop keeps _____ in final control.", ["humans"]],
    ],
    short: [
      ["What is AI ethics?", "AI ethics are rules that ensure AI systems are fair, safe and responsible."],
      ["Give one example of historical bias.", "A hiring AI preferring men because past hiring data mostly included men."],
      ["Why is transparency important in AI?", "Transparency helps users understand how AI makes decisions and builds trust."],
      ["Name two rights of digital users.", "Right to privacy and right to safety."],
      ["What is data bias?", "Data bias occurs when training data is unfair or unbalanced, leading to unfair AI decisions."],
    ],
    apply: [
      ["A hiring system prefers male candidates because past data mostly included men. What type of bias is this?", "Historical bias"],
      ["A health AI diagnoses illness based only on money spent on treatment. What type of bias is this?", "Measurement bias"],
      ["A loan application is rejected by AI. Why should a human review the decision?", "To ensure fairness and check for errors or bias."],
      ["A student shares false news online. Which responsibility is not followed?", "Verifying information (responsible use)."],
    ],
    tables: [
      { title: "One-word challenge: which word matches the description?", choices: ["Bias", "Underrepresentation", "Human-in-the-loop", "Ethics", "Digital citizenship"], rows: [
        ["Repeating past unfair patterns", "Bias"], ["Missing groups in training data", "Underrepresentation"], ["Final decision taken by humans", "Human-in-the-loop"],
        ["Moral rules that guide decisions", "Ethics"], ["Responsible use of technology", "Digital citizenship"],
      ] },
    ],
  }),
];
