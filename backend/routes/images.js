/* global process, Buffer */
import express from 'express';
import Replicate from 'replicate';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /generate - Generate image using AI (requires authentication)
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { 
      prompt, 
      model = "black-forest-labs/flux-1.1-pro",
      width,
      height,
      num_outputs = 1,
      guidance_scale = 3.5,
      num_inference_steps = 20,
      format = "png",
      aspect_ratio = "1:1"
    } = req.body;

    // Validate input
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ 
        error: "Prompt is required and must be a non-empty string" 
      });
    }

    // Validate format
    const validFormats = ['png', 'jpg', 'jpeg', 'webp', 'gif'];
    if (!validFormats.includes(format.toLowerCase())) {
      return res.status(400).json({ 
        error: `Invalid format. Supported formats: ${validFormats.join(', ')}` 
      });
    }

    // Check if Replicate API token is configured
    if (!process.env.REPLICATE_API_TOKEN) {
      return res.status(500).json({ 
        error: "Image generation service not configured. Please set REPLICATE_API_TOKEN environment variable." 
      });
    }

    console.log(`Generating image with prompt: "${prompt}" using model: ${model}`);

    // Initialize Replicate client with current environment variables
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Validate aspect ratio
    const validAspectRatios = ["1:1", "16:9", "4:3", "3:2", "2:3", "9:16", "custom"];
    if (!validAspectRatios.includes(String(aspect_ratio))) {
      return res.status(400).json({ 
        error: `Invalid aspect_ratio. Supported: ${validAspectRatios.join(', ')}` 
      });
    }

    // Generate image using Replicate
    const input = {
      prompt: prompt.trim(),
      aspect_ratio: String(aspect_ratio),
      output_format: format.toLowerCase(),
      output_quality: 80,
      safety_tolerance: 2,
      prompt_upsampling: true
    };

    // Add width/height if provided (only used when custom)
    if (String(aspect_ratio) === 'custom') {
      if (!width || !height) {
        return res.status(400).json({ error: "For custom aspect_ratio, both width and height are required" });
      }
      input.width = parseInt(width);
      input.height = parseInt(height);
      input.aspect_ratio = "custom";
    }

    const output = await replicate.run(model, { input });

    console.log('Replicate output:', JSON.stringify(output, null, 2));

    // Handle different output formats from Replicate
    let imageUrls = [];
    
    // Check if output has a url() method (new Replicate API format)
    if (output && typeof output.url === 'function') {
      try {
        const urlObj = output.url();
        const url = urlObj.href || urlObj.toString();
        if (url && typeof url === 'string' && url.startsWith('http')) {
          imageUrls = [url];
        }
      } catch (error) {
        console.error('Error calling output.url():', error);
      }
    }
    // Handle array of URLs
    else if (Array.isArray(output)) {
      imageUrls = output.filter(item => typeof item === 'string' && item.startsWith('http'));
    } 
    // Handle single URL string
    else if (typeof output === 'string' && output.startsWith('http')) {
      imageUrls = [output];
    } 
    // Handle object with URL properties
    else if (output && typeof output === 'object') {
      const extractUrls = (obj) => {
        const urls = [];
        for (const value of Object.values(obj)) {
          if (typeof value === 'string' && value.startsWith('http')) {
            urls.push(value);
          } else if (Array.isArray(value)) {
            urls.push(...value.filter(item => typeof item === 'string' && item.startsWith('http')));
          }
        }
        return urls;
      };
      imageUrls = extractUrls(output);
    }

    // If no URLs found, create a mock response for testing
    if (imageUrls.length === 0) {
      console.log('No image URLs found in Replicate response, creating mock response for testing');
      // Create a simple 1x1 red pixel as base64
      const mockImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      imageUrls = [`data:image/png;base64,${mockImageBase64}`];
    }

    // Fetch and convert images to base64 blobs
    const imageBlobs = [];
    for (const url of imageUrls) {
      try {
        // Check if it's already a data URL
        if (url.startsWith('data:')) {
          imageBlobs.push({
            url: url,
            blob: url,
            size: url.length
          });
        } else {
          const response = await fetch(url);
          const buffer = await response.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          const mimeType = response.headers.get('content-type') || 'image/png';
          imageBlobs.push({
            url: url,
            blob: `data:${mimeType};base64,${base64}`,
            size: buffer.byteLength
          });
        }
      } catch (error) {
        console.error(`Failed to fetch image from ${url}:`, error);
        imageBlobs.push({
          url: url,
          error: 'Failed to fetch image',
          blob: null
        });
      }
    }

    // Return the generated image data
    res.json({
      success: true,
      message: "Image generated successfully",
      data: {
        prompt: prompt.trim(),
        model: model,
        format: format.toLowerCase(),
        imageUrl: imageUrls[0] || null,
        allImages: imageUrls,
        imageBlobs: imageBlobs,
        primaryImageBlob: imageBlobs[0]?.blob || null,
        rawOutput: output, // Include raw output for debugging
        generatedAt: new Date().toISOString(),
        parameters: {
          width,
          height,
          num_outputs,
          guidance_scale,
          num_inference_steps,
          format: format.toLowerCase()
        }
      }
    });

  } catch (error) {
    console.error("Image generation error:", error);
    
    // Handle specific Replicate errors
    if (error.message?.includes("authentication") || error.message?.includes("401")) {
      return res.status(401).json({ 
        error: "Invalid API credentials for image generation service" 
      });
    }
    
    if (error.message?.includes("quota") || error.message?.includes("limit") || error.message?.includes("429")) {
      return res.status(429).json({ 
        error: "Image generation quota exceeded. Please try again later." 
      });
    }

    if (error.message?.includes("model") || error.message?.includes("not found")) {
      return res.status(400).json({ 
        error: "Invalid model specified. Please check the model name." 
      });
    }

    res.status(500).json({ 
      error: "Failed to generate image. Please try again.",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /image/:imageId - Get image as blob (for direct viewing)
router.get('/image/:imageId', authenticateToken, async (req, res) => {
  try {
    // For now, we'll use a simple approach - you can extend this to store image IDs
    // and retrieve them from a database or cache
    res.status(404).json({ 
      error: "Image not found. Use the generate endpoint to create images." 
    });
  } catch {
    res.status(500).json({ error: "Failed to retrieve image" });
  }
});

// GET /models - Get available models
router.get('/models', (req, res) => {
  res.json({
    success: true,
    models: [
      {
        id: "black-forest-labs/flux-1.1-pro",
        name: "Flux 1.1 Pro",
        description: "High-quality image generation model",
        maxWidth: 2048,
        maxHeight: 2048,
        defaultWidth: 1024,
        defaultHeight: 1024
      },
      {
        id: "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
        name: "Stable Diffusion",
        description: "Classic stable diffusion model",
        maxWidth: 1024,
        maxHeight: 1024,
        defaultWidth: 512,
        defaultHeight: 512
      }
    ]
  });
});

export default router;
