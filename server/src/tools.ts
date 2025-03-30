import type { Tool } from "@anthropic-ai/sdk/resources/index.mjs";

export const petTools: Tool[] = [
  {
    name: 'pet_show_list_card',
    description: 'tool から受け取ったリストデータをユーザーに表示します。これを使うことでアシスタントは言葉で説明するのではなく、リストを表示することができます。画像はなるべく表示するようにしてください。',
    input_schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'リストのタイトル',
        },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'アイテムのタイトル',
              },
              description: {
                type: 'string',
                optional: true,
                description: 'アイテムの説明',
              },
              imageUrl: {
                type: 'string',
                optional: true,
                description: 'アイテムの画像URL',
              },
            }
          }
        }
      }
    }
  },
  {
    name: 'pet_show_detail_card',
    description: 'tool から受け取った詳細データをユーザーに表示します。show_list_card とは対象的に、一つの情報を詳細にユーザーに説明したいときに使います。',
    input_schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: '詳細のタイトル',
        },
        description: {
          type: 'string',
          optional: true,
          description: '詳細の説明',
        },
        imageUrl: {
          type: 'string',
          optional: true,
          description: '詳細の画像URL',
        },
      }
    }
  },
  {
    name: 'pet_reset_conversation',
    description: '会話をリセットします。これを使うことで、アシスタントは新しい会話を開始することができます。話題を変えたいときや、会話をリセットしたいときに使います。',
    input_schema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          description: 'リセットの理由',
        },
      }
    }
  },
]