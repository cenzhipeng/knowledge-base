import resource

resource.setrlimit(resource.RLIMIT_NOFILE, (3, 3333333333))
# open('test.py', 'r', encoding='utf-8')
