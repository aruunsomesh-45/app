from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key=os.getenv("VITE_GEMINI_API_KEY"),
)

print(f"Using API Key: {os.getenv('VITE_GEMINI_API_KEY')[:10]}...") 

# First API call with reasoning
try:
    print("Making first request...")
    response = client.chat.completions.create(
      model="google/gemini-2.0-flash-exp:free", # Using a known free model for testing
      messages=[
              {
                "role": "user",
                "content": "How many r's are in the word 'strawberry'?"
              }
            ],
      # extra_body={"reasoning": {"enabled": True}} # Not all models support this, removing for general test
    )

    print("First response received:")
    print(response.choices[0].message.content)

    # Extract the assistant message
    first_response_message = response.choices[0].message

    # Preserve the assistant message 
    messages = [
      {"role": "user", "content": "How many r's are in the word 'strawberry'?"},
      first_response_message, # Pass back the message object directly or construct dict
      {"role": "user", "content": "Are you sure? Think carefully."}
    ]

    print("\nMaking second request...")
    # Second API call
    response2 = client.chat.completions.create(
      model="google/gemini-2.0-flash-exp:free",
      messages=messages,
    )
    
    print("Second response received:")
    print(response2.choices[0].message.content)
    print("\nAPI Connection Successful!")

except Exception as e:
    import traceback
    traceback.print_exc()
    print(f"\nAPI Error: {e}")
