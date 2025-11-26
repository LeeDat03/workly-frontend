import { apiPaths } from '@/configs/route';
import { PostResponse } from '@/models/profileModel';
import { getPaging } from '@/utils/api';
import { PagingResponse } from '@/utils/models/ResponseType';

type FeedParams = {
    page: number;
    size: number;
};

const FeedService = {
    async getFeed(params: FeedParams): Promise<PagingResponse<PostResponse>> {
        return getPaging({ url: apiPaths.getFeed, params });
    },
};

export default FeedService;
