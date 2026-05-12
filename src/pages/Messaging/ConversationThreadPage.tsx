import { useLocation, useParams } from 'react-router-dom';
import { ConversationThreadPanel } from '@/components/messaging/ConversationThreadPanel';
import { sellerHubPaths } from '@/constants/sellerHub';

const ConversationThreadPage = () => {
  const { conversationId = '' } = useParams();
  const location = useLocation();

  const backHref = location.pathname.includes('thong-ke-cua-hang')
    ? sellerHubPaths.messages
    : '/';

  return (
    <ConversationThreadPanel
      conversationId={conversationId}
      variant="page"
      backHref={backHref}
    />
  );
};

export default ConversationThreadPage;
