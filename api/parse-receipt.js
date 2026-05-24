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

  "total":0
}

Rules:
- Include purchased food items
- Exclude tax
- Exclude subtotal
- Exclude payment info
- Exclude tip suggestions
- Match names/prices intelligently
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


    const parsed =
      JSON.parse(
        response.output_text
      );


    return res
      .status(200)
      .json(
        parsed
      );

  }

  catch(error) {

    console.error(
      error
    );

    return res
      .status(500)
      .json({

        error:
          "Receipt parsing failed"

      });

  }

}
