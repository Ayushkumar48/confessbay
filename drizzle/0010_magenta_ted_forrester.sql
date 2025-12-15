CREATE OR REPLACE FUNCTION notify_unread_count_change()
RETURNS trigger AS $$
BEGIN
  -- Only notify if unread counts actually changed
  IF NEW.unread_count_user1 IS DISTINCT FROM OLD.unread_count_user1
     OR NEW.unread_count_user2 IS DISTINCT FROM OLD.unread_count_user2 THEN

    PERFORM pg_notify(
      'conversation_unread_changed',
      json_build_object(
        'conversationId', NEW.id,
        'userId1', NEW.user_id1,
        'userId2', NEW.user_id2,
        'unreadCountUser1', NEW.unread_count_user1,
        'unreadCountUser2', NEW.unread_count_user2,
        'updatedAt', NEW.updated_at
      )::text
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_unread_count_change
AFTER UPDATE OF unread_count_user1, unread_count_user2
ON conversations
FOR EACH ROW
EXECUTE FUNCTION notify_unread_count_change();
