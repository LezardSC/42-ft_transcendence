FORBIDDEN_USERNAMES_REGEXPS = [
    'None',
    'Sudo',
    'sudo',
    'SUDO',
    'null',
    'Null',
    'NULL',

    'about',
	'account',
	'activate',
	'add',
	'admin',
	'administrator',
	'api',
	'app',
	'apps',
	'archive',
	'archives',
	'auth',
	'blog',
	'cache',
	'cancel',
	'careers',
	'cart',
	'changelog',
	'checkout',
	'codereview',
	'compare',
	'config',
	'configuration',
	'connect',
	'contact',
	'create',
	'delete',
	'direct_messages',
	'documentation',
	'download',
	'downloads',
	'edit',
	'email',
	'employment',
	'enterprise',
	'faq',
	'favorites',
	'feed',
	'feedback',
	'feeds',
	'fleet',
	'fleets',
	'follow',
	'followers',
	'following',
	'friend',
	'friends',
	'gist',
	'group',
	'groups',
	'help',
	'home',
	'hosting',
	'hostmaster',
	'index',
	'info',
	'invitations',
	'invite',
	'is',
	'it',
	'job',
	'jobs',
	'json',
	'language',
	'languages',
	'lists',
	'login',
	'logout',
	'logs',
	'mail',
	'map',
	'maps',
	'mine',
	'mis',
	'news',
	'oauth',
	'oauth_clients',
	'offers',
	'openid',
	'order',
	'orders',
	'organizations',
	'plans',
	'post',
	'postmaster',
	'privacy',
	'put',
	'recruitment',
	'register',
	'remove',
	'replies',
	'root',
	'rss',
	'sales',
	'save',
	'security',
	'sessions',
	'settings',
	'signup',
	'sitemap',
	'ssl',
	'ssladmin',
	'ssladministrator',
	'sslwebmaster',
	'status',
	'stories',
	'styleguide',
	'subscribe',
	'subscriptions',
	'support',
	'sysadmin',
	'sysadministrator',
	'translations',
	'trends',
	'unfollow',
	'unsubscribe',
	'update',
	'url',
	'user',
	'weather',
	'webmaster',
	'widget',
	'widgets',
	'ww',
	'www',
	'wwww',
	'xfn',
	'xml',
	'xmpp',
	'yaml',
	'yml',
]

def check_if_forbidden_username(username):
    if username not in FORBIDDEN_USERNAMES_REGEXPS:
        return False
    return True