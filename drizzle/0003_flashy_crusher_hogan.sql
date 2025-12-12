ALTER TABLE "notifications" ALTER COLUMN "created_at" SET NOT NULL;

-- Create a function that will update the last_message_id in conversations table
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the conversation's last_message_id with the newly inserted chat message
    UPDATE conversations
    SET last_message_id = NEW.id,
        updated_at = NOW()
    WHERE id = NEW.conversation_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that fires after INSERT on chats table
CREATE TRIGGER trigger_update_conversation_last_message
    AFTER INSERT ON chats
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();
