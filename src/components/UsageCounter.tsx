import { FC } from 'react';

interface UsageCounterProps {
  imageUploads: number;
  chatInteractions: number;
}

const UsageCounter: FC<UsageCounterProps> = ({ imageUploads, chatInteractions }) => {
  return (
    <div className="fixed top-0 right-0 md:w-auto w-full backdrop-blur-md bg-white/30 border border-white/30 rounded-bl-2xl md:rounded-bl-2xl md:rounded-tr-none p-4 shadow-lg">
      <div className="flex md:flex-col gap-4 justify-center text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span className="font-medium">📸 Images:</span>
          <span>{imageUploads}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">💬 Chats:</span>
          <span>{chatInteractions}</span>
        </div>
      </div>
    </div>
  );
};

export default UsageCounter; 