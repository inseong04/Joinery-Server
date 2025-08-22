export enum NotificationType {
    LIKE = 'LIKE',
    LIKE_ACCEPTED = 'LIKE_ACCEPTED',
    LIKE_REJECTED = 'LIKE_REJECTED',
    MEMBER_JOINED = 'MEMBER_JOINED',
}

export type LikeMeta = { 
    postId:string;
    actorId:string;
    name?:string;
    postTitle?:string;
};
export type LikeAcceptedMeta = {
    postId:string;
    actorId:string;
    postTitle?:string;
    name?:string;
};
export type LikeRejectedMeta = {
    postId:string;
    actorId:string;
    postTitle?:string;
    name?:string;
};
export type MemberJoinedMeta = {
    postId:string;
    actorId:string;
    name?:string;
    postTitle?:string;
};

export type NotificationMetaMap = {
    [NotificationType.LIKE] : LikeMeta,
    [NotificationType.LIKE_ACCEPTED]: LikeAcceptedMeta;
    [NotificationType.LIKE_REJECTED]: LikeRejectedMeta;
    [NotificationType.MEMBER_JOINED]: MemberJoinedMeta;
}

export const TEMPLATES: Record<NotificationType, string> ={
    [NotificationType.LIKE]:'{{name}} 님이 {{postTitle}} 동행에 동행을 요청했어요.',
    [NotificationType.LIKE_ACCEPTED]:'신청하신 {{postTitle}} 동행이 수락되었어요',
    [NotificationType.LIKE_REJECTED]:'신청하신 {{postTitle}} 동행이 거절되었어요',
    [NotificationType.MEMBER_JOINED]:'참가하신 {{postTitle}} 동행에 {{name}} 님이 참가했어요',
};