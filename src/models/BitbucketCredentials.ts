import {APIClient} from 'bitbucket'
import Credentials from './Credentials'

export default interface BitbucketCredentials {
    bitbucket: APIClient,
    credentials: Credentials
}