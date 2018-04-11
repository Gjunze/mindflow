#!/bin/bash

npm run prod
rm -f dist.tgz
tar czf dist.tgz dist
scp dist.tgz root@cs.mindflow.pro:.
ssh root@cs.mindflow.pro "( cd /root/mf-composer/mf-web-dist && rm -rf dist && tar xzf /root/dist.tgz )"
ssh root@cs.mindflow.pro "(cd /root/mf-composer && docker-compose restart fe)"