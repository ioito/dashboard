<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('cloudenv.text_604')}}</div>
    <div slot="body">
      <a-form-model ref="ruleForm" :model="formData" :rules="rules" v-bind="layout">
        <!-- 条件 -->
        <a-form-model-item :label="$t('cloudenv.text_22')" v-bind="layout" :rules="rules.condition" prop="condition">
          <a-select v-model="formData.condition">
            <a-select-option v-for="item in resourceAndTagOptions" :value="item.value" :key="item.value" :disabled="item.value === 'and_copy' && isSecAndcopy()">
              {{item.name}}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <!-- 标签key -->
        <template v-if="formData.condition === 'and_copy'">
          <a-form-model-item :label="$t('cloudenv.tag_key')" v-bind="layout" :rules="rules.tag_key" prop="tag_key">
            <a-input v-model="formData.tag_key" />
          </a-form-model-item>
        </template>
        <template v-else>
          <!-- 标签 -->
          <a-form-model-item :label="$t('cloudenv.text_16')" v-bind="layout" :rules="rules.tags" prop="tags">
            <tag :defaultChecked="formData.defaultTags" @change="handleTagChange" />
          </a-form-model-item>
          <!-- 项目 -->
          <a-form-model-item :label="$t('cloudenv.text_584')" :extra="$t('cloudenv.text_592')" v-bind="layout" :rules="rules.project_id" prop="project_id">
            <!-- <a-select v-model="formData.project_id" show-search option-filter-prop="children" :filter-option="filterOption">
              <a-select-option v-for="item in projectOptions" :key="item.id" :value="item.id">
                {{item.name}}
              </a-select-option>
            </a-select> -->
            <base-select
              resource="projects"
              :params="projectParams"
              v-model="formData.project_id"
              :select-props="{placeholder: $t('common.tips.select', [$t('cloudenv.text_584')])}" />
          </a-form-model-item>
        </template>
      </a-form-model>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import Tag from '../components/Tag'
export default {
  name: 'ProjectMappingRuleEditDialog',
  components: {
    Tag,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const { editType } = this.params
    const projectDomainInitialValue = this.params.projectDomainId || this.$store.getters.userInfo.projectDomainId
    let initFormData = {
      condition: 'and',
      tags: {},
      tag_key: '',
      project_id: '',
    }
    if (editType === 'edit') {
      const data = this.params.data[0]
      const initCondition = data.condition === 'and' && !data.hasOwnProperty('project_id') ? 'and_copy' : data.condition
      const tags = this.initTags(data.tags)
      if (initCondition === 'and_copy') {
        initFormData = { condition: initCondition, tag_key: data.tags[0]?.key }
      } else {
        initFormData = { condition: data.condition, tags: tags, defaultTags: R.clone(tags), project_id: data.project_id }
      }
    }
    return {
      loading: false,
      formData: initFormData,
      rules: {
        condition: [
          { required: true, message: this.$t('common.tips.select', [this.$t('cloudenv.text_22')]) },
        ],
        tags: [
          { required: true, validator: this.validateTags },
        ],
        tag_key: [
          { required: true, message: this.$t('common.tips.input', [this.$t('cloudenv.tag_key')]) },
        ],
        project_id: [
          { required: true, message: this.$t('common.tips.select', [this.$t('cloudenv.text_584')]) },
        ],
      },
      layout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
      resourceAndTagOptions: [
        {
          id: 1,
          name: this.$t('cloudenv.text_587'),
          value: 'or',
        },
        {
          id: 2,
          name: this.$t('cloudenv.text_588'),
          value: 'and',
        },
        {
          id: 3,
          name: this.$t('cloudenv.match_by_tag_key'),
          value: 'and_copy',
        },
      ],
      projectDomainId: projectDomainInitialValue,
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'isDomainMode', 'userInfo', 'l3PermissionEnable']),
    projectParams () {
      return {
        scope: this.scope,
        project_domain_id: this.params.projectDomainId,
      }
    },
    editIndex () {
      const { data, rules } = this.params
      let idx = rules.length
      rules.map((item, index) => {
        if (item._XID === data[0]._XID) {
          idx = index
        }
      })
      return idx
    },
  },
  methods: {
    initTags (tagArr = []) {
      const tags = {}
      tagArr.map(item => {
        const key = 'user:' + item.key
        if (!tags[key]) {
          tags[key] = []
        }
        tags[key].push(item.value)
      })
      return tags
    },
    handleTagChange (val) {
      console.log('tag change', val)
      this.formData.tags = val
    },
    isSecAndcopy () {
      const { editType, rules } = this.params
      const index = editType === 'create' ? rules.length : this.editIndex
      let has = false
      rules.map((item, idx) => {
        if (item.condition === 'and' && !item.hasOwnProperty('project_id') && index !== idx) {
          has = true
        }
      })
      return has
    },
    getUpdateParams () {
      const { rules, editType } = this.params
      const ruleList = rules.map(item => {
        const ret = { condition: item.condition, tags: item.tags, auto_create_project: item.auto_create_project }
        if (item.project_id) {
          ret.project_id = item.project_id
          ret.project = item.project
        }
        return ret
      })
      let newRule = {}
      if (this.formData.condition === 'and_copy') {
        newRule = {
          condition: 'and',
          tags: [{ key: this.formData.tag_key }],
          auto_create_project: true,
        }
      } else {
        newRule = {
          condition: this.formData.condition,
          project_id: this.formData.project_id,
          tags: this.getTagValue(this.formData.tags),
        }
      }
      if (editType === 'create') {
        return [...ruleList, newRule]
      } else if (editType === 'edit') {
        return ruleList.map((item, index) => {
          if (index === this.editIndex) {
            return newRule
          }
          return item
        })
      }
      return ruleList
    },
    getTagValue (tag) {
      const result = []
      const keys = Object.keys(tag)
      keys.map(key => {
        result.push({
          key: R.replace(/(ext:|user:)/, '', key),
          value: tag[key],
        })
      })
      return result
    },
    validateTags (rule, value, callback) {
      if (value) {
        const keys = Object.keys(value)
        if (!keys.length) {
          callback(new Error(this.$t('common.tips.select', [this.$t('cloudenv.text_16')])))
        } else if (keys.length > 20) {
          callback(new Error(this.$t('cloudenv.text_602')))
        } else {
          callback()
        }
      } else {
        callback(new Error(this.$t('common.tips.select', [this.$t('cloudenv.text_16')])))
      }
    },
    doUpdate (data) {
      return new this.$Manager('project_mappings').update({ id: this.params.id, data: data })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const validate = await this.$refs.ruleForm.validate()
        if (!validate) return
        // 获取参数
        const rules = this.getUpdateParams()
        await this.doUpdate({ rules })
        this.cancelDialog()
        this.$bus.$emit('ProjectMappingRuleUpdate')
        this.$message.success(this.$t('common.success'))
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
