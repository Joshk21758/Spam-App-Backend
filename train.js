import tf from "@tensorflow/tfjs";
import fs from "fs";

// Custom Hardcoded Dataset
const dataset = [
  { text: "Get free cash now click here", label: 1 },
  { text: "Urgent claim your prize immediately", label: 1 },
  { text: "Special promotion discount entry code", label: 1 },
  { text: "Hey are you free for lunch today", label: 0 },
  { text: "Please send me the project report", label: 0 },
  { text: "Hello mom I will call you later", label: 0 },
];

// Configuration parameters
const MAX_WORDS = 10;
const VOCAB = { "<PAD>": 0 }; // Initialize vocabulary with a padding token
let wordCounter = 1;

// Build Vocabulary Dictionary dynamically from our dataset
dataset.forEach((item) => {
  const words = item.text.toLowerCase().split(/\s+/);
  words.forEach((word) => {
    if (VOCAB[word] === undefined) {
      VOCAB[word] = wordCounter++;
    }
  });
});

// Save vocabulary to a JSON file so your React Native App can use it
fs.writeFileSync("./vocab.json", JSON.stringify(VOCAB, null, 2));
console.log(`Saved vocabulary with ${Object.keys(VOCAB).length} tokens.`);

// Convert text data into numeric padded arrays
const sequences = dataset.map((item) => {
  const words = item.text.toLowerCase().split(/\s+/);
  let seq = words.map((word) => VOCAB[word] || 0);

  // Pad with 0s if too short, or truncate if too long
  if (seq.length < MAX_WORDS) {
    seq = [...seq, ...Array(MAX_WORDS - seq.length).fill(0)];
  } else {
    seq = seq.slice(0, MAX_WORDS);
  }
  return seq;
});

const labels = dataset.map((item) => item.label);

// Convert to TensorFlow Tensors
const xs = tf.tensor2d(sequences, [sequences.length, MAX_WORDS]);
const ys = tf.tensor2d(labels, [labels.length, 1]);

// Define Neural Network Architecture
async function run() {
  const model = tf.sequential();

  // Input layer expecting a vector of MAX_WORDS size
  model.add(
    tf.layers.dense({ units: 16, inputShape: [MAX_WORDS], activation: "relu" }),
  );
  model.add(tf.layers.dense({ units: 8, activation: "relu" }));
  // Output layer: Sigmoid returns a value between 0 (Ham) and 1 (Spam)
  model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));

  model.compile({
    optimizer: "adam",
    loss: "binaryCrossentropy",
    metrics: ["accuracy"],
  });

  console.log("Training model... Please wait.");

  // Train the model
  await model.fit(xs, ys, {
    epochs: 100, // Number of loops through the dataset
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        if (epoch % 20 === 0)
          console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}`);
      },
    },
  });

  console.log("Training complete!");

  // Save model files for your React Native app
  // This will generate 'model.json' and 'weights.bin' in the specified folder
  const dir = "./model-export";
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  // tensorflow convertion of the model
  model.save(
    tf.io.withSaveHandler(async (artifacts) => {
      // Extract and format the weights data
      const weightsBuffer = Buffer.from(artifacts.weightData);

      // Create a clean copy of topology mappping
      const modelTopology = {
        modelTopology: artifacts.modelTopology,
        weightsManifest: [
          {
            paths: ["./weights.bin"],
            weights: artifacts.weightSpecs,
          },
        ],
      };

      // Use fs to write files
      fs.writeFileSync(
        `${dir}/model.json`,
        JSON.stringify(modelTopology, null, 2),
      );
      fs.writeFileSync(`${dir}/weights.bin`, weightsBuffer);

      console.log("Model saved successfully!");
      return {
        modelArtifactsInfo: {
          dateSaved: new Date(),
          modelTopologyType: "JSON",
        },
      };
    }),
  );
}

run();
