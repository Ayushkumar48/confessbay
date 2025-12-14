ALTER TABLE "friends" ALTER COLUMN "requested_by" SET NOT NULL;

-- Function to increment unread count when a new message is inserted
CREATE OR REPLACE FUNCTION increment_unread_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Determine which user is receiving the message and increment their unread count
    UPDATE conversations
    SET
        unread_count_user1 = CASE
            WHEN user_id1 != NEW.sender_id THEN unread_count_user1 + 1
            ELSE unread_count_user1
        END,
        unread_count_user2 = CASE
            WHEN user_id2 != NEW.sender_id THEN unread_count_user2 + 1
            ELSE unread_count_user2
        END,
        updated_at = NOW()
    WHERE id = NEW.conversation_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement unread count when messages are marked as read
CREATE OR REPLACE FUNCTION decrement_unread_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Only decrement if read_at was NULL before and is now set (message being marked as read)
    IF OLD.read_at IS NULL AND NEW.read_at IS NOT NULL THEN
        -- Determine which user is reading the message and decrement their unread count
        UPDATE conversations
        SET
            unread_count_user1 = CASE
                WHEN user_id1 != NEW.sender_id AND unread_count_user1 > 0
                THEN unread_count_user1 - 1
                ELSE unread_count_user1
            END,
            unread_count_user2 = CASE
                WHEN user_id2 != NEW.sender_id AND unread_count_user2 > 0
                THEN unread_count_user2 - 1
                ELSE unread_count_user2
            END,
            updated_at = NOW()
        WHERE id = NEW.conversation_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for incrementing unread count on new message
CREATE TRIGGER trigger_increment_unread_count
    AFTER INSERT ON chats
    FOR EACH ROW
    EXECUTE FUNCTION increment_unread_count();

-- Trigger for decrementing unread count when message is read
CREATE TRIGGER trigger_decrement_unread_count
    AFTER UPDATE OF read_at ON chats
    FOR EACH ROW
    EXECUTE FUNCTION decrement_unread_count();
