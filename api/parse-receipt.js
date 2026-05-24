//
//  parse-receipt.js
//  
//
//  Created by Ian Lopez on 5/23/26.
//

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(
  req,
  res
) {

  if (req.method !== "POST") {

    return res
      .status(405)
      .json({
        error:
          "Method not allowed"
      });

  }


  try {

    const {
      image
    } =
    req.body;


    if (!image) {

      return res
        .status(400)
        .json({

          error:
            "Missing image"

        });

    }


    const response =
      await client
        .responses
        .create({

          model:
            "gpt-4.1-mini",

          input: [

            {

              role:
                "user",

              content: [

                {

                  type:
                    "input_text",

                text:
                `
                Parse this restaurant receipt.

                Return ONLY valid JSON:

                {
                  "items":[
                    {
                      "name":"",
                      "cost":0
                    }
                  ],

                  "subtotal":0,
                  "tax":0,
                  "tip":0,
                  "total":0
                }

                Rules:
                - Include purchased food items
                - Exclude payment info
                - Exclude card info
                - Exclude authorization codes
                - Match names/prices intelligently
                - Extract subtotal when present
                - Extract tax when present
                - Extract tip when present
                - If no tip exists, return 0
                - Extract final total
                - Return numbers only (no "$")
                `
                },

                {

                  type:
                    "input_image",

                  image_url:
                    `data:image/jpeg;base64,${image}`

                }

              ]

            }

          ]

        });


      let rawText =
        response.output_text
          .trim();


      rawText =
        rawText
          .replace(
            /^```json\s*/i,
            ""
          )
          .replace(
            /^```\s*/i,
            ""
          )
          .replace(
            /```$/i,
            ""
          )
          .trim();


      const parsed =
        JSON.parse(
          rawText
        );


    return res
      .status(200)
      .json(
        parsed
      );

  }

    catch (error) {
      console.error("Receipt parsing failed:", error);

      const statusCode = error.status || error.statusCode || 500;

      return res.status(statusCode).json({
        error: error.name || "ReceiptParsingError",
        message: error.message || "Receipt parsing failed",
        status: statusCode
      });
    }
}
