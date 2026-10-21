-- Link a conversation to a project so project teams have a shared, persisted channel.
-- The column is nullable so existing direct (user to user) conversations are preserved.
ALTER TABLE conversations
    ADD COLUMN project_id VARCHAR(36) NULL AFTER title;

-- One shared conversation per project.
CREATE UNIQUE INDEX uk_conversations_project_id ON conversations (project_id);

ALTER TABLE conversations
    ADD CONSTRAINT fk_conversations_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE;

-- Support chronological message history reads.
CREATE INDEX idx_messages_conversation_created ON messages (conversation_id, created_at);
